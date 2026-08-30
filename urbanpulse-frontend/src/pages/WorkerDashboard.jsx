import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Leaf,
  User,
  LogOut,
  Truck,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Clock,
  Map as MapIcon,
  Navigation,
  X,
  Send,
  Loader2,
  RefreshCw,
  Inbox,
  CircleDot,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { workerService } from '../api/worker.service.js';
import { authService } from '../api/auth.service.js';

/* ------------------------------------------------------------------ */
/*  Theme                                                              */
/* ------------------------------------------------------------------ */

const THEME = {
  deepForest: '#0B3D2E',
  darkGreen: '#064E3B',
  emerald: '#059669',
  lightEmerald: '#D1FAE5',
  amber: '#F59E0B',
  lightAmber: '#FEF3C7',
  red: '#DC2626',
  lightRed: '#FEE2E2',
};

/* ------------------------------------------------------------------ */
/*  Defensive data helpers                                             */
/* ------------------------------------------------------------------ */

const isNum = (v) => typeof v === 'number' && !Number.isNaN(v);

function unwrapResponse(res) {
  if (res && typeof res === 'object' && 'data' in res && !Array.isArray(res)) {
    return res.data;
  }
  return res;
}

function toArray(payload, keys = ['results', 'routes', 'data', 'items', 'stops', 'points', 'collection_points']) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    for (const key of keys) {
      if (Array.isArray(payload[key])) return payload[key];
    }
  }
  return null;
}

function extractAssignedRoute(payload) {
  if (!payload) return null;
  const list = toArray(payload);
  if (list) {
    if (list.length === 0) return null;
    const active = list.find((r) => {
      const s = (r?.status ?? r?.route_status ?? r?.routeStatus ?? '').toString().toLowerCase();
      return s.includes('active') || s.includes('assigned') || s.includes('progress') || s.includes('ongoing');
    });
    return active || list[0];
  }
  if (typeof payload === 'object') return payload;
  return null;
}

function extractStopsList(payload) {
  if (!payload) return [];
  const list = toArray(payload);
  if (list) return list;
  if (typeof payload === 'object') return [payload];
  return [];
}

const getRouteId = (route) => route?.id ?? route?.route_id ?? route?.routeId ?? route?._id ?? null;

const getRouteNumber = (route) =>
  route?.route_number ?? route?.routeNumber ?? route?.number ?? route?.code ?? getRouteId(route) ?? '—';

const getRouteName = (route) =>
  route?.route_name ?? route?.routeName ?? route?.name ?? route?.ward ?? route?.area ?? route?.zone ?? '';

const getStopId = (stop) => stop?.id ?? stop?._id ?? stop?.point_id ?? stop?.pointId ?? null;

const getStopLocation = (stop) =>
  stop?.location ?? stop?.name ?? stop?.address ?? stop?.location_name ?? stop?.locationName ?? stop?.title ?? 'Unnamed location';

const getStopEta = (stop) =>
  stop?.estimated_arrival ?? stop?.estimatedArrival ?? stop?.eta ?? stop?.arrival_time ?? stop?.arrivalTime ?? null;

const getIssueReason = (stop) =>
  stop?.issue_reason ?? stop?.issueReason ?? stop?.reason ?? stop?.concern_description ?? stop?.concernDescription ?? null;

function normalizeStatus(raw) {
  const s = (raw ?? '').toString().toLowerCase();
  if (!s) return 'pending';
  if (s.includes('issue') || s.includes('report') || s.includes('problem')) return 'issue';
  if (s.includes('collect') || s.includes('done') || s.includes('complete')) return 'collected';
  return 'pending';
}

function getStopCoords(stop) {
  const c = stop?.coordinates ?? stop?.coords ?? stop?.location_coordinates ?? stop?.locationCoordinates ?? null;

  if (Array.isArray(c) && c.length >= 2 && isNum(c[0]) && isNum(c[1])) {
    const [a, b] = c;
    if (Math.abs(a) > 90 && Math.abs(b) <= 90) {
      return { lat: b, lng: a };
    }
    if (Math.abs(b) > 90 && Math.abs(a) <= 90) {
      return { lat: a, lng: b };
    }
    return { lat: b, lng: a };
  }

  if (c && typeof c === 'object' && !Array.isArray(c)) {
    const lat = c.lat ?? c.latitude;
    const lng = c.lng ?? c.lon ?? c.long ?? c.longitude;
    if (isNum(lat) && isNum(lng)) return { lat, lng };
  }

  const lat = stop?.latitude ?? stop?.lat;
  const lng = stop?.longitude ?? stop?.lng ?? stop?.lon;
  if (isNum(lat) && isNum(lng)) return { lat, lng };

  return null;
}

function normalizeStop(stop, index) {
  return {
    id: getStopId(stop),
    row: index + 1,
    location: getStopLocation(stop),
    eta: getStopEta(stop),
    status: normalizeStatus(stop?.status ?? stop?.state ?? stop?.collection_status),
    issueReason: getIssueReason(stop),
    coords: getStopCoords(stop),
    raw: stop,
  };
}

/* ------------------------------------------------------------------ */
/*  Toast system                                                       */
/* ------------------------------------------------------------------ */

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const push = useCallback(
    (type, message) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, type, message, leaving: false }]);
      timers.current[id] = window.setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  useEffect(
    () => () => {
      Object.values(timers.current).forEach((t) => window.clearTimeout(t));
    },
    []
  );

  return { toasts, push, remove };
}

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="fixed top-6 right-6 z-[1000] flex flex-col gap-3 w-[min(360px,calc(100vw-3rem))]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md transition-all duration-300 ease-out
          ${t.leaving ? 'opacity-0 translate-x-6' : 'opacity-100 translate-x-0'}
          ${
            t.type === 'success'
              ? 'bg-emerald-50/95 border-emerald-300 text-emerald-900'
              : 'bg-red-50/95 border-red-300 text-red-900'
          }`}
        >
          {t.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mt-0.5 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-red-600" />
          )}
          <p className="text-sm font-medium leading-snug flex-1">{t.message}</p>
          <button
            onClick={() => onDismiss(t.id)}
            className="opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Circular progress meter                                            */
/* ------------------------------------------------------------------ */

function CircularProgress({ completed, total }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0">
        <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="8" />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="#D1FAE5"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-sm font-bold">{pct}%</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs uppercase tracking-wide text-emerald-100/80 font-medium">Progress</p>
        <p className="text-lg font-bold text-white leading-tight">
          {completed}/{total} Completed
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Status badge                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ status, issueReason }) {
  if (status === 'collected') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5" />
        Collected
      </span>
    );
  }
  if (status === 'issue') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <AlertTriangle className="w-3.5 h-3.5" />
        Issue Reported{issueReason ? ` (${issueReason})` : ''}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
      <CircleDot className="w-3.5 h-3.5" />
      Pending
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Leaflet helpers                                                    */
/* ------------------------------------------------------------------ */

const MARKER_COLORS = {
  collected: THEME.emerald,
  pending: THEME.amber,
  issue: THEME.red,
};

function createNumberedIcon(number, color) {
  return L.divIcon({
    className: 'urbanpulse-marker',
    html: `
      <div style="
        width:30px;height:30px;
        border-radius:50% 50% 50% 0;
        background:${color};
        border:2px solid #ffffff;
        box-shadow:0 2px 6px rgba(0,0,0,0.35);
        transform:rotate(-45deg);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="
          transform:rotate(45deg);
          color:#ffffff;font-weight:700;font-size:12px;font-family:sans-serif;
        ">${number}</span>
      </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });
}

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (!positions || positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 15);
    } else {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [48, 48] });
    }
  }, [positions, map]);
  return null;
}

function RouteMap({ stops }) {
  const stopsWithCoords = useMemo(() => stops.filter((s) => s.coords), [stops]);
  const positions = useMemo(() => stopsWithCoords.map((s) => [s.coords.lat, s.coords.lng]), [stopsWithCoords]);

  if (stopsWithCoords.length === 0) {
    return (
      <div className="w-full h-[420px] rounded-2xl bg-emerald-950/40 border border-white/10 flex flex-col items-center justify-center text-center px-6">
        <MapIcon className="w-10 h-10 text-emerald-200/50 mb-3" />
        <p className="text-emerald-50 font-semibold">Location coordinates are not available for this route.</p>
        <p className="text-emerald-100/60 text-sm mt-1">Stops will appear on the map once coordinate data is provided by the API.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[420px] rounded-2xl overflow-hidden border border-white/10 shadow-xl">
      <MapContainer center={positions[0]} zoom={14} scrollWheelZoom style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds positions={positions} />
        <Polyline positions={positions} pathOptions={{ color: THEME.emerald, weight: 4, opacity: 0.85 }} />
        {stopsWithCoords.map((s) => (
          <Marker
            key={s.id ?? s.row}
            position={[s.coords.lat, s.coords.lng]}
            icon={createNumberedIcon(s.row, MARKER_COLORS[s.status])}
          >
            <Popup>
              <div style={{ fontFamily: 'sans-serif', minWidth: 160 }}>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>
                  Stop #{s.row} — {s.location}
                </p>
                <p style={{ margin: 0, textTransform: 'capitalize' }}>
                  Status: <strong>{s.status === 'issue' ? 'Issue reported' : s.status}</strong>
                </p>
                {s.status === 'issue' && s.issueReason && <p style={{ margin: '4px 0 0', color: THEME.red }}>Reason: {s.issueReason}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Report Issue modal                                                 */
/* ------------------------------------------------------------------ */

function ReportIssueModal({ stop, onClose, onSubmit, submitting }) {
  const [reason, setReason] = useState('');

  if (!stop) return null;

  const disabled = reason.trim().length === 0 || submitting;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-emerald-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#0B3D2E] to-[#064E3B]">
          <div>
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
              Report Issue
            </h3>
            <p className="text-emerald-100/80 text-sm mt-0.5">{stop.location}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <label className="block text-sm font-medium text-gray-700">Issue description</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Describe the issue (e.g. House Locked, Damaged Bin, Road Blocked)"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            disabled={submitting}
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit(reason.trim())}
              disabled={disabled}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function WorkerDashboard() {
  const { toasts, push: pushToast, remove: removeToast } = useToasts();

  const [userName, setUserName] = useState('Sanitation Worker');

  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(true);
  const [routeError, setRouteError] = useState(null);

  const [stops, setStops] = useState([]);
  const [stopsLoading, setStopsLoading] = useState(false);
  const [stopsError, setStopsError] = useState(null);

  const [mapOpen, setMapOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [issueModalStop, setIssueModalStop] = useState(null);
  const [submittingIssue, setSubmittingIssue] = useState(false);

  const routeId = getRouteId(route);

  /* -------------------------- Load user -------------------------- */
  useEffect(() => {
    try {
      const current = authService?.getCurrentUser?.() ?? authService?.currentUser ?? null;
      const name = current?.name ?? current?.fullName ?? current?.full_name ?? current?.username;
      if (name) setUserName(name);
    } catch (e) {
      // Non-fatal
    }
  }, []);

  /* -------------------------- Load route -------------------------- */
  const loadRoute = useCallback(async () => {
    setRouteLoading(true);
    setRouteError(null);
    try {
      const res = await workerService.get('/collection-routes');
      const data = unwrapResponse(res);
      const assigned = extractAssignedRoute(data);
      setRoute(assigned);
    } catch (err) {
      setRouteError(err?.response?.data?.message ?? err?.message ?? 'Failed to load your assigned route.');
    } finally {
      setRouteLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoute();
  }, [loadRoute]);

  /* -------------------------- Load stops -------------------------- */
  const loadStops = useCallback(async () => {
    if (!routeId) return;
    setStopsLoading(true);
    setStopsError(null);
    try {
      const res = await workerService.get(`/collection-points/route/${routeId}`);
      const data = unwrapResponse(res);
      const list = extractStopsList(data);
      setStops(list.map(normalizeStop));
    } catch (err) {
      setStopsError(err?.response?.data?.message ?? err?.message ?? 'Failed to load collection stops.');
    } finally {
      setStopsLoading(false);
    }
  }, [routeId]);

  useEffect(() => {
    loadStops();
  }, [loadStops]);

  /* -------------------------- Derived progress -------------------------- */
  const totalStops = stops.length;
  const completedStops = useMemo(() => stops.filter((s) => s.status === 'collected').length, [stops]);

  /* -------------------------- Actions -------------------------- */
  const handleMarkDone = useCallback(
    async (stop) => {
      if (!stop.id || actionLoadingId) return;
      setActionLoadingId(stop.id);
      try {
        await workerService.patch(`/collection-points/${stop.id}/collect`);
        setStops((prev) => prev.map((s) => (s.id === stop.id ? { ...s, status: 'collected', issueReason: null } : s)));
        pushToast('success', 'Stop marked as collected successfully.');
      } catch (err) {
        pushToast('error', err?.response?.data?.message ?? err?.message ?? 'Could not mark this stop as collected.');
      } finally {
        setActionLoadingId(null);
      }
    },
    [actionLoadingId, pushToast]
  );

  const handleOpenIssueModal = useCallback((stop) => {
    setIssueModalStop(stop);
  }, []);

  const handleCloseIssueModal = useCallback(() => {
    if (submittingIssue) return;
    setIssueModalStop(null);
  }, [submittingIssue]);

  const handleSubmitIssue = useCallback(
    async (reason) => {
      if (!issueModalStop || !reason) return;
      setSubmittingIssue(true);
      try {
        const payload = {
          category: 'missed_pickup',
          description: `Issue at ${issueModalStop.location}: ${reason}`,
          location: issueModalStop.coords,
          priority: 'high',
        };
        await workerService.post('/concerns/', payload);
        setStops((prev) =>
          prev.map((s) => (s.id === issueModalStop.id ? { ...s, status: 'issue', issueReason: reason } : s))
        );
        pushToast('success', 'Issue reported successfully.');
        setIssueModalStop(null);
      } catch (err) {
        pushToast('error', err?.response?.data?.message ?? err?.message ?? 'Could not submit this issue.');
      } finally {
        setSubmittingIssue(false);
      }
    },
    [issueModalStop, pushToast]
  );

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Proceed to redirect regardless of API failure
    } finally {
      window.location.href = '/login';
    }
  }, []);

  /* -------------------------- Render -------------------------- */

  const navLinks = ['About Us', 'Features', 'Contact Us', 'Raise A Concern'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
      <ToastStack toasts={toasts} onDismiss={removeToast} />

      {/* Header */}
      <header className="sticky top-0 z-40" style={{ background: `linear-gradient(90deg, ${THEME.deepForest}, ${THEME.darkGreen})` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Leaf className="w-7 h-7 text-emerald-400" />
            <span className="text-xl font-bold text-white">
              Urban<span className="text-emerald-400">Pulse</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 overflow-x-auto">
            {navLinks.map((label) => (
              <a
                key={label}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-sm font-medium text-emerald-50/80 hover:text-white transition-colors whitespace-nowrap"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-emerald-800/60 border border-emerald-400/30 flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-200" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-white">{userName}</p>
                <p className="text-xs text-emerald-300">Worker</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-2 text-sm font-semibold text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Route loading */}
        {routeLoading && (
          <div className="rounded-2xl bg-white/70 border border-emerald-100 shadow-lg p-10 flex flex-col items-center justify-center gap-3 text-emerald-800">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="font-medium">Loading your assigned route…</p>
          </div>
        )}

        {/* Route error */}
        {!routeLoading && routeError && (
          <div className="rounded-2xl bg-red-50 border border-red-200 shadow-lg p-10 flex flex-col items-center justify-center gap-3 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <p className="font-semibold text-red-700">{routeError}</p>
            <button
              onClick={loadRoute}
              className="inline-flex items-center gap-2 mt-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* No assigned route */}
        {!routeLoading && !routeError && !route && (
          <div className="rounded-2xl bg-white/70 border border-emerald-100 shadow-lg p-10 flex flex-col items-center justify-center gap-3 text-center text-emerald-800">
            <Inbox className="w-8 h-8 text-emerald-400" />
            <p className="font-semibold">No route is currently assigned to you.</p>
            <p className="text-sm text-emerald-700/70">Check back once your supervisor assigns a collection route.</p>
          </div>
        )}

        {/* Route card */}
        {!routeLoading && !routeError && route && (
          <div
            className="rounded-3xl shadow-2xl overflow-hidden border border-white/10"
            style={{ background: `linear-gradient(135deg, ${THEME.deepForest}f2, ${THEME.darkGreen}f2)` }}
          >
            <div className="p-6 sm:p-8 backdrop-blur-md">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3 flex-wrap">
                      Route #{getRouteNumber(route)}
                      {getRouteName(route) && <span className="text-emerald-300">- {getRouteName(route)}</span>}
                      <Truck className="w-7 h-7 text-emerald-300" />
                    </h1>
                    <p className="text-emerald-100/70 text-sm mt-1">Today's assigned collection route</p>
                  </div>
                </div>

                <CircularProgress completed={completedStops} total={totalStops} />
              </div>

              {/* Stops checklist */}
              <div className="mt-8 rounded-2xl bg-white/95 shadow-inner overflow-hidden">
                <div className="px-5 py-4 border-b border-emerald-100 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-emerald-700" />
                  <h2 className="font-bold text-emerald-900">Stops Checklist</h2>
                </div>

                {stopsLoading && (
                  <div className="p-10 flex flex-col items-center justify-center gap-3 text-emerald-800">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <p className="text-sm font-medium">Loading collection stops…</p>
                  </div>
                )}

                {!stopsLoading && stopsError && (
                  <div className="p-8 flex flex-col items-center justify-center gap-3 text-center">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <p className="text-sm font-semibold text-red-700">{stopsError}</p>
                    <button
                      onClick={loadStops}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retry
                    </button>
                  </div>
                )}

                {!stopsLoading && !stopsError && stops.length === 0 && (
                  <div className="p-8 flex flex-col items-center justify-center gap-2 text-center text-emerald-800">
                    <Inbox className="w-6 h-6 text-emerald-400" />
                    <p className="text-sm font-medium">No collection stops are currently assigned to this route.</p>
                  </div>
                )}

                {!stopsLoading && !stopsError && stops.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[720px]">
                      <thead>
                        <tr className="text-left text-emerald-900/60 text-xs uppercase tracking-wide">
                          <th className="px-5 py-3 font-semibold">Row</th>
                          <th className="px-5 py-3 font-semibold">Location</th>
                          <th className="px-5 py-3 font-semibold">Estimated Arrival</th>
                          <th className="px-5 py-3 font-semibold">Status</th>
                          <th className="px-5 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {stops.map((stop) => (
                          <tr key={stop.id ?? stop.row} className="hover:bg-emerald-50/50 transition-colors">
                            <td className="px-5 py-4 font-semibold text-emerald-900">{stop.row}</td>
                            <td className="px-5 py-4 text-gray-700">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>{stop.location}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {stop.eta ?? '—'}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <StatusBadge status={stop.status} issueReason={stop.issueReason} />
                            </td>
                            <td className="px-5 py-4">
                              {stop.status === 'pending' ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <button
                                    onClick={() => handleMarkDone(stop)}
                                    disabled={actionLoadingId === stop.id}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 transition-colors"
                                  >
                                    {actionLoadingId === stop.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-3.5 h-3.5" />
                                    )}
                                    Mark Done
                                  </button>
                                  <button
                                    onClick={() => handleOpenIssueModal(stop)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 transition-colors"
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Report Issue
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Map toggle */}
              {!stopsLoading && !stopsError && stops.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setMapOpen((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-3 shadow-lg transition-colors"
                  >
                    <MapIcon className="w-5 h-5" />
                    {mapOpen ? 'Hide Route Map' : 'Open Route Map'}
                  </button>
                </div>
              )}

              {/* Map */}
              {mapOpen && !stopsLoading && !stopsError && stops.length > 0 && (
                <div className="mt-6">
                  <RouteMap stops={stops} />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <ReportIssueModal
        stop={issueModalStop}
        onClose={handleCloseIssueModal}
        onSubmit={handleSubmitIssue}
        submitting={submittingIssue}
      />
    </div>
  );
}