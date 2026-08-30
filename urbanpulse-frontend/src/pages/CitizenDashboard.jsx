import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  ChevronDown,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  MapPin,
  LayoutDashboard,
  Layers,
  Clock,
  CheckCircle2,
  ClipboardList,
  MessageSquare,
  Send,
  Truck,
  AlertTriangle,
  Wrench,
  ChevronRight,
  LogOut,
  User,
  Check,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { citizenService } from "../api/citizen.service";
import { authService } from "../api/auth.service";
import FloatingChatbot from "../components/FloatingChatbot";
import ConcernImageGallery from "../components/report-concern/ConcernImageGallery";
import NotificationDropdown from "../components/NotificationDropdown";
import { useNavigate } from "react-router-dom";

const DEFAULT_CENTER = { lat: 22.5726, lng: 88.3639 };

const SUGGESTION_TYPES = [
  { value: "waste_pickup", label: "Waste Pickup" },
  { value: "add_bin", label: "Add Bin" },
  { value: "general", label: "General" },
  { value: "other", label: "Other" },
];

const CONCERN_STATUS_STYLES = {
  open: {
    label: "Open",
    badge: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    dot: "bg-blue-500",
  },
  pending: {
    label: "Pending",
    badge: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
    dot: "bg-rose-500",
  },
  assigned: {
    label: "Assigned",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    dot: "bg-amber-500",
  },
  resolved: {
    label: "Resolved",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "Closed",
    badge: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
    dot: "bg-slate-400",
  },
};

const PRIORITY_STYLES = {
  low: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
  medium: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  high: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
  critical: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  urgent: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
};

const SUGGESTION_STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
};

const DELETABLE_STATUSES = ["open", "pending"];

function toTitleCase(value) {
  if (!value) return "Unknown";
  return String(value)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatLocation(loc) {
  if (!loc) return "—";
  if (typeof loc === "string") return loc;
  if (typeof loc === "object") {
    const lat = loc.latitude ?? loc.lat;
    const lng = loc.longitude ?? loc.lng;
    if (lat != null && lng != null) {
      return `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
    }
    return loc.address || loc.name || "Coordinates unavailable";
  }
  return String(loc);
}

function getConcernStatusStyle(status) {
  const key = String(status || "").toLowerCase();
  if (CONCERN_STATUS_STYLES[key]) return CONCERN_STATUS_STYLES[key];
  return {
    label: toTitleCase(status),
    badge: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
    dot: "bg-slate-400",
  };
}

function getPriorityStyle(priority) {
  const key = String(priority || "").toLowerCase();
  return (
    PRIORITY_STYLES[key] ||
    "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"
  );
}

function getSuggestionStatusStyle(status) {
  const key = String(status || "").toLowerCase();
  return (
    SUGGESTION_STATUS_STYLES[key] ||
    "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"
  );
}

function formatDate(isoString) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getCategoryIcon(category) {
  const key = String(category || "").toLowerCase();
  if (key.includes("overflow")) return Trash2;
  if (key.includes("pickup") || key.includes("missed")) return Truck;
  if (key.includes("dump") || key.includes("illegal")) return AlertTriangle;
  if (key.includes("damage") || key.includes("broken")) return Wrench;
  return ClipboardList;
}

function extractErrorMessage(error, fallback) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) => item.msg || item.message)
      .filter(Boolean)
      .join(" ");
  }
  return fallback;
}

function getInitials(name) {
  if (!name) return "SK";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const pinIcon = L.divIcon({
  className: "urbanpulse-pin",
  html: `
    <svg width="34" height="42" viewBox="0 0 34 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 12.4 17 25 17 25s17-12.6 17-25C34 7.6 26.4 0 17 0z" fill="#16A34A"/>
      <circle cx="17" cy="17" r="7" fill="white"/>
    </svg>
  `,
  iconSize: [34, 42],
  iconAnchor: [17, 42],
  popupAnchor: [0, -38],
});

function MapReadyFixer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function LocationPicker({ position, onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return (
    <Marker
      position={position}
      icon={pinIcon}
      draggable
      eventHandlers={{
        dragend: (e) => onSelect(e.target.getLatLng()),
      }}
    />
  );
}

function StatCard({ icon: Icon, title, value, subtitle, loading, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          {loading ? (
            <div className="mt-3 h-9 w-16 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
    </motion.div>
  );
}

function StatusBadge({ styleClass, label, dot }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styleClass}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {label}
    </span>
  );
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          className={`fixed right-4 top-4 z-[1000] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${
            toast.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={onClose}
            className="ml-auto shrink-0 text-current/60 hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ConfirmDeleteDialog({ concern, onCancel, onConfirm, deleting }) {
  return (
    <AnimatePresence>
      {concern && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1001] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Delete this concern?
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">
              You're about to delete{" "}
              <span className="font-medium text-slate-700">
                "{concern.category || concern.title || "Concern"}"
              </span>
              {concern.location && (
                <>
                  {" "}
                  at{" "}
                  <span className="font-medium text-slate-700">
                    {formatLocation(concern.location)}
                  </span>
                </>
              )}
              . This can't be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={onCancel}
                disabled={deleting}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Dashboard stats
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

  // Concerns
  const [concerns, setConcerns] = useState([]);
  const [concernsLoading, setConcernsLoading] = useState(true);
  const [concernsError, setConcernsError] = useState(null);
  const [expandedConcernId, setExpandedConcernId] = useState(null);
  const [concernToDelete, setConcernToDelete] = useState(null);
  const [deletingConcern, setDeletingConcern] = useState(false);

  // Suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [suggestionsError, setSuggestionsError] = useState(null);

  // Suggestion drawer / form
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_CENTER);
  const [suggestionForm, setSuggestionForm] = useState({
    title: "",
    description: "",
    suggestion_type: "waste_pickup",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState(null);
  const toastIdRef = useRef(0);

  const showToast = useCallback((type, message) => {
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, type, message });
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await authService.getCurrentUser();
      if (data) setUserProfile(data);
    } catch (err) {
      console.error("Failed to load citizen profile:", err);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const data = await citizenService.getDashboardStats();
      setDashboardData(data);
    } catch (err) {
      setDashboardError(
        extractErrorMessage(err, "Unable to load dashboard data."),
      );
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  const fetchConcerns = useCallback(async () => {
    setConcernsLoading(true);
    setConcernsError(null);
    try {
      const data = await citizenService.getConcerns();
      setConcerns(Array.isArray(data) ? data : []);
    } catch (err) {
      setConcernsError(
        extractErrorMessage(err, "Unable to load your concerns."),
      );
    } finally {
      setConcernsLoading(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async () => {
    setSuggestionsLoading(true);
    setSuggestionsError(null);
    try {
      const data = await citizenService.getSuggestions();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      setSuggestionsError(
        extractErrorMessage(err, "Unable to load your suggestions."),
      );
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchDashboard();
    fetchConcerns();
    fetchSuggestions();
  }, [fetchProfile, fetchDashboard, fetchConcerns, fetchSuggestions]);

  const handleConfirmDelete = async () => {
    if (!concernToDelete) return;
    const targetId = concernToDelete.id || concernToDelete._id;
    setDeletingConcern(true);
    try {
      await citizenService.deleteConcern(targetId);
      setConcerns((prev) => prev.filter((c) => (c.id || c._id) !== targetId));
      setDashboardData((prev) =>
        prev
          ? {
              ...prev,
              total_concerns: Math.max(0, (prev.total_concerns ?? 1) - 1),
              pending_concerns: DELETABLE_STATUSES.includes(
                String(concernToDelete.status).toLowerCase(),
              )
                ? Math.max(0, (prev.pending_concerns ?? 1) - 1)
                : prev.pending_concerns,
            }
          : prev,
      );
      showToast("success", "Concern deleted successfully.");
      setConcernToDelete(null);
    } catch (err) {
      showToast(
        "error",
        extractErrorMessage(
          err,
          "Could not delete this concern. Please try again.",
        ),
      );
    } finally {
      setDeletingConcern(false);
    }
  };

  const openDrawer = () => {
    setFormErrors({});
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (submitting) return;
    setDrawerOpen(false);
  };

  const handleSubmitSuggestion = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setFormErrors({});

    const payload = {
      title: suggestionForm.title.trim(),
      description: suggestionForm.description.trim(),
      suggestion_type: suggestionForm.suggestion_type,
      latitude:
        selectedLocation?.lat != null ? Number(selectedLocation.lat) : null,
      longitude:
        selectedLocation?.lng != null ? Number(selectedLocation.lng) : null,
    };

    try {
      await citizenService.createSuggestion(payload);
      showToast("success", "Suggestion submitted successfully!");
      setSuggestionForm({
        title: "",
        description: "",
        suggestion_type: "waste_pickup",
      });
      setDrawerOpen(false);
      fetchSuggestions();
      fetchDashboard();
    } catch (err) {
      if (err?.response?.status === 422) {
        const detail = err.response.data?.detail;
        if (Array.isArray(detail)) {
          const fieldErrors = {};
          detail.forEach((item) => {
            const field = item.loc?.[item.loc.length - 1];
            if (field) fieldErrors[field] = item.msg;
          });
          setFormErrors(fieldErrors);
        }
        showToast("error", "Validation error. Please check your inputs.");
      } else {
        showToast(
          "error",
          extractErrorMessage(
            err,
            "Could not submit suggestion. Please try again.",
          ),
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const userName =
    userProfile?.full_name || userProfile?.name || "Sneha Kesharwani";

  return (
    <div className="min-h-screen bg-[#F4F8F6]">
      {/* Navbar */}
      <header className="sticky top-3 z-40 mx-3 rounded-2xl bg-gradient-to-r from-[#005B4F] to-[#00473e] shadow-lg">
        <div className="flex w-full items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:px-7">
          {/* Logo */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm">
              <Leaf className="h-6 w-6 text-white" strokeWidth={2.25} />
            </div>

            <div className="min-w-0 leading-tight">
              <p className="truncate text-lg font-bold text-white">
                Urban<span className="text-emerald-400">Pulse</span>
              </p>

              <p className="truncate text-[11px] font-medium text-emerald-200/70">
                Smart Waste Management
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            {/* Extracted Notification Dropdown Component */}
            <NotificationDropdown />

            {/* Divider */}
            <span className="hidden h-8 w-px bg-white/15 sm:block" />

            {/* Profile */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-3 rounded-full py-1 pl-1.5 pr-2.5 transition hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#123524] shadow-sm ring-2 ring-white/20">
                  {getInitials(userName)}
                </span>

                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-sm font-bold text-white">
                    {userName}
                  </span>

                  <span className="block text-[11px] text-emerald-200/70">
                    Citizen
                  </span>
                </span>

                <ChevronDown className="hidden h-4 w-4 text-emerald-100/70 sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 z-50 divide-y divide-slate-100">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <User className="h-4 w-4 text-slate-500" />
                    Profile
                  </button>
                  <button
                    onClick={() => authService.logout()}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Citizen Dashboard
          </h1>

          <div className="inline-flex w-fit items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <span className="flex items-center gap-2 rounded-lg bg-[#005B4F] px-3.5 py-2 text-sm font-medium text-white">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard View
            </span>
            <button
              type="button"
              onClick={openDrawer}
              className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <MapPin className="h-4 w-4" />
              Suggest Point
            </button>
          </div>
        </div>

        {/* Stats */}
        {dashboardError ? (
          <div className="mb-8 flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Unable to load dashboard data.
                </p>
                <p className="text-sm text-red-600">Please try again.</p>
              </div>
            </div>
            <button
              onClick={fetchDashboard}
              className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3.5 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        ) : (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              index={0}
              icon={Layers}
              title="Total Reported Concerns"
              value={dashboardData?.total_concerns ?? 0}
              subtitle="My total reports"
              loading={dashboardLoading}
            />
            <StatCard
              index={1}
              icon={Clock}
              title="Pending Concerns"
              value={dashboardData?.pending_concerns ?? 0}
              subtitle="Awaiting resolution"
              loading={dashboardLoading}
            />
            <StatCard
              index={2}
              icon={CheckCircle2}
              title="Resolved Concerns"
              value={dashboardData?.resolved_concerns ?? 0}
              subtitle="Successfully resolved"
              loading={dashboardLoading}
            />
          </div>
        )}

        {/* Raise Concern CTA */}
        <div className="mb-10 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => navigate("/report-concern")}
            className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#005B4F] to-[#00473e] px-7 py-3.5 text-base font-semibold text-white shadow-md transition hover:shadow-lg"
          >
            <AlertCircle className="h-5 w-5 text-emerald-300" />
            Raise Concerns
            <ChevronRight className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Concerns List */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">
              My Concerns List
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {concernsError ? (
              <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <p className="text-sm font-medium text-slate-700">
                  Unable to load your concerns.
                </p>
                <button
                  onClick={fetchConcerns}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </button>
              </div>
            ) : concernsLoading ? (
              <div className="space-y-3 p-5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-lg bg-slate-100"
                  />
                ))}
              </div>
            ) : concerns.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                <ClipboardList className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">
                  No concerns reported yet.
                </p>
                <p className="text-xs text-slate-400">
                  Concerns you report will show up here.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500">
                        <th className="pl-12 pr-5 py-3 font-medium text-left">
                          Category
                        </th>
                        <th className="px-5 py-3 font-medium text-left">
                          Location
                        </th>
                        <th className="px-5 py-3 font-medium text-left">
                          Reported Date
                        </th>
                        <th className="px-5 py-3 font-medium text-left">
                          Priority
                        </th>
                        <th className="px-5 py-3 font-medium text-left">
                          Status
                        </th>
                        <th
                          colSpan={2}
                          className="pl-5 pr-12 py-3 font-medium text-center"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {concerns.map((concern) => {
                        const concernId = concern.id || concern._id;
                        const statusStyle = getConcernStatusStyle(
                          concern.status,
                        );
                        const CategoryIcon = getCategoryIcon(concern.category);
                        const canDelete = DELETABLE_STATUSES.includes(
                          String(concern.status).toLowerCase(),
                        );
                        const isExpanded = expandedConcernId === concernId;

                        return (
                          <Fragment key={concernId}>
                            <tr className="transition hover:bg-slate-50/60">
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2.5">
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                    <CategoryIcon className="h-4 w-4" />
                                  </span>
                                  <span className="font-medium text-slate-800">
                                    {concern.category || "General"}
                                  </span>
                                </div>
                              </td>
                              <td className="max-w-[220px] truncate px-5 py-3.5 text-slate-600">
                                {formatLocation(concern.location)}
                              </td>
                              <td className="px-5 py-3.5 text-slate-600">
                                {formatDate(concern.created_at)}
                              </td>
                              <td className="px-5 py-3.5">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getPriorityStyle(concern.priority)}`}
                                >
                                  {concern.priority || "N/A"}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <StatusBadge
                                  styleClass={statusStyle.badge}
                                  label={statusStyle.label}
                                  dot={statusStyle.dot}
                                />
                              </td>

                              {/* First Action Column: Delete Button */}
                              <td className="pl-5 pr-1 py-3 text-right">
                                {canDelete && (
                                  <button
                                    onClick={() => setConcernToDelete(concern)}
                                    aria-label="Delete concern"
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 inline-block"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </td>

                              {/* Second Action Column: View Button */}
                              <td className="pl-1 pr-12 py-3.5 text-right">
                                <button
                                  onClick={() =>
                                    setExpandedConcernId(
                                      isExpanded ? null : concernId,
                                    )
                                  }
                                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 ml-auto"
                                >
                                  View
                                  <ChevronRight
                                    className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                  />
                                </button>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-slate-50/60">
                                <td
                                  colSpan={7}
                                  className="px-5 py-4 text-sm text-slate-600"
                                >
                                  <div className="space-y-3">
                                    <div>
                                      <span className="font-medium text-slate-700">
                                        Description:{" "}
                                      </span>
                                      {concern.description ||
                                        "No additional description provided."}
                                    </div>

                                    {/* Isolated Image Gallery Component */}
                                    <ConcernImageGallery
                                      concernId={concernId}
                                    />
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-slate-100 sm:hidden">
                  {concerns.map((concern) => {
                    const concernId = concern.id || concern._id;
                    const statusStyle = getConcernStatusStyle(concern.status);
                    const CategoryIcon = getCategoryIcon(concern.category);
                    const canDelete = DELETABLE_STATUSES.includes(
                      String(concern.status).toLowerCase(),
                    );
                    const isExpanded = expandedConcernId === concernId;

                    return (
                      <div key={concernId} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                              <CategoryIcon className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="font-medium text-slate-800">
                                {concern.category || "General"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatLocation(concern.location)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {canDelete && (
                              <button
                                onClick={() => setConcernToDelete(concern)}
                                aria-label="Delete concern"
                                className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}

                            <button
                              onClick={() =>
                                setExpandedConcernId(
                                  isExpanded ? null : concernId,
                                )
                              }
                              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                            >
                              View
                              <ChevronRight
                                className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                              />
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <StatusBadge
                            styleClass={statusStyle.badge}
                            label={statusStyle.label}
                            dot={statusStyle.dot}
                          />
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getPriorityStyle(concern.priority)}`}
                          >
                            {concern.priority || "N/A"}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatDate(concern.created_at)}
                          </span>
                        </div>

                        {/* Mobile Expanded View */}
                        {isExpanded && (
                          <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
                            <p className="text-xs">
                              <span className="font-medium text-slate-700">
                                Description:{" "}
                              </span>
                              {concern.description ||
                                "No additional description provided."}
                            </p>

                            <ConcernImageGallery concernId={concernId} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Suggestion History */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Suggestion History
              </h2>
            </div>
            {typeof dashboardData?.total_suggestions === "number" && (
              <span className="text-xs font-medium text-slate-400">
                {dashboardData.total_suggestions} total
              </span>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {suggestionsError ? (
              <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <p className="text-sm font-medium text-slate-700">
                  Unable to load your suggestions.
                </p>
                <button
                  onClick={fetchSuggestions}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </button>
              </div>
            ) : suggestionsLoading ? (
              <div className="space-y-3 p-5">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-lg bg-slate-100"
                  />
                ))}
              </div>
            ) : suggestions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                <MapPin className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">
                  No suggestions submitted yet.
                </p>
                <p className="text-xs text-slate-400">
                  Suggest a new waste pick point to get started.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {suggestions.map((suggestion) => {
                  const sugId = suggestion.id || suggestion._id;
                  return (
                    <div key={sugId} className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-800">
                            {suggestion.title || `Point #${sugId}`}
                          </p>
                          {suggestion.suggestion_type && (
                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                              {toTitleCase(suggestion.suggestion_type)}
                            </span>
                          )}
                        </div>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getSuggestionStatusStyle(suggestion.status)}`}
                        >
                          {toTitleCase(suggestion.status || "pending")}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-slate-600">
                        {suggestion.description ||
                          `Lat: ${suggestion.latitude}, Lng: ${suggestion.longitude}`}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        Submitted {formatDate(suggestion.created_at)}
                      </p>
                      {suggestion.admin_reply && (
                        <div className="mt-3 rounded-lg bg-emerald-50/70 px-3.5 py-2.5 text-sm text-emerald-800">
                          <span className="font-medium">Admin reply: </span>
                          {suggestion.admin_reply}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Suggest Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 z-[900] bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="fixed right-0 top-0 z-[901] flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <h3 className="text-lg font-bold text-slate-900">
                  Suggest New Waste Pick Point
                </h3>
                <button
                  onClick={closeDrawer}
                  aria-label="Close"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmitSuggestion}
                className="flex flex-1 flex-col overflow-y-auto px-6 py-5"
              >
                <label className="mb-2 text-sm font-medium text-slate-700">
                  Select Location
                </label>
                <div
                  className="h-64 w-full shrink-0 overflow-hidden rounded-xl border border-slate-200"
                  style={{ height: "256px" }}
                >
                  <MapContainer
                    center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
                    zoom={13}
                    scrollWheelZoom
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapReadyFixer />
                    <LocationPicker
                      position={[selectedLocation.lat, selectedLocation.lng]}
                      onSelect={(latlng) =>
                        setSelectedLocation({
                          lat: latlng.lat,
                          lng: latlng.lng,
                        })
                      }
                    />
                  </MapContainer>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Tap the map or drag the pin to choose a spot.
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-[11px] font-medium uppercase text-slate-400">
                      Latitude
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {selectedLocation.lat.toFixed(6)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-[11px] font-medium uppercase text-slate-400">
                      Longitude
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {selectedLocation.lng.toFixed(6)}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Suggestion Type
                  </label>
                  <select
                    value={suggestionForm.suggestion_type}
                    onChange={(e) =>
                      setSuggestionForm((prev) => ({
                        ...prev,
                        suggestion_type: e.target.value,
                      }))
                    }
                    className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                      formErrors.suggestion_type
                        ? "border-red-300"
                        : "border-slate-200"
                    }`}
                  >
                    {SUGGESTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.suggestion_type && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.suggestion_type}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Suggestion Title
                  </label>
                  <input
                    type="text"
                    value={suggestionForm.title}
                    onChange={(e) =>
                      setSuggestionForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="e.g. Need a bin near the park entrance"
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                      formErrors.title ? "border-red-300" : "border-slate-200"
                    }`}
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.title}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={suggestionForm.description}
                    onChange={(e) =>
                      setSuggestionForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe why a waste collection point/bin is needed here..."
                    className={`w-full resize-none rounded-lg border px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                      formErrors.description
                        ? "border-red-300"
                        : "border-slate-200"
                    }`}
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.description}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#005B4F] to-[#00473e] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {submitting ? "Submitting…" : "Submit Suggestion"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDeleteDialog
        concern={concernToDelete}
        deleting={deletingConcern}
        onCancel={() => (!deletingConcern ? setConcernToDelete(null) : null)}
        onConfirm={handleConfirmDelete}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Floating AI Chatbot */}
      <FloatingChatbot />
    </div>
  );
}