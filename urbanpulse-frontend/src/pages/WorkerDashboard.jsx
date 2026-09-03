import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Navigation,
  ClipboardList,
  Map as MapIcon,
  Loader2,
  RefreshCw,
  Inbox,
} from "lucide-react";
import WorkerHeader from "../components/worker/WorkerHeader";
import WorkerMetricStrip from "../components/worker/WorkerMetricStrip";
import WorkerRouteSummary from "../components/worker/WorkerRouteSummary";
import WorkerStopsTable from "../components/worker/WorkerStopsTable";
import WorkerRouteMap from "../components/worker/WorkerRouteMap";
import WorkerAssignmentsView from "../components/worker/WorkerAssignmentsView";
import ReportIssueModal from "../components/worker/ReportIssueModal";
import FloatingChatbot from "../components/FloatingChatbot";

import { workerService } from "../api/worker.service";
import { assignmentService } from "../api/assignment.service";
import { concernService } from "../api/concern.service";
import { authService } from "../api/auth.service";
import { coordsToLocationString } from "../api/location.service";

/* ------------------------------------------------------------------ */
/* Helpers & Location Resolvers                                       */
/* ------------------------------------------------------------------ */
const isNum = (v) => typeof v === "number" && !Number.isNaN(v);

// Check karta hai agar text raw coordinates format me hai (jaise "22.5726, 88.3639")
function isCoordinateString(str) {
  if (!str || typeof str !== "string") return false;
  return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(str.trim());
}

function getStopCoords(stop) {
  const c = stop?.coordinates ?? stop?.coords ?? null;
  if (Array.isArray(c) && c.length >= 2 && isNum(c[0]) && isNum(c[1])) {
    return { lat: c[0], lng: c[1] };
  }
  if (c && typeof c === "object") {
    const lat = c.lat ?? c.latitude;
    const lng = c.lng ?? c.longitude;
    if (isNum(lat) && isNum(lng)) return { lat, lng };
  }
  const lat = stop?.latitude ?? stop?.lat;
  const lng = stop?.longitude ?? stop?.lng;
  if (isNum(lat) && isNum(lng)) return { lat: Number(lat), lng: Number(lng) };
  return null;
}

// Coordinates ki jagah Route Name return karta hai
function resolveStopLocation(stop, index, currentRoute) {
  const routeName =
    currentRoute?.route_name ||
    currentRoute?.name ||
    stop?.route_name ||
    (currentRoute?.route_number ? `Route #${currentRoute.route_number}` : "Assigned Route");

  // Agar stop ka apna koi real street/area name hai to wahi dikhaye
  if (stop?.point_name && !isCoordinateString(stop.point_name)) {
    return stop.point_name;
  }
  if (
    stop?.location &&
    typeof stop.location === "string" &&
    stop.location.trim() &&
    stop.location !== "Unnamed location" &&
    !isCoordinateString(stop.location)
  ) {
    return stop.location;
  }
  if (stop?.address && !isCoordinateString(stop.address)) {
    return stop.address;
  }

  // Agar raw lat/long coordinates the, to use Route Name aur Stop number se replace kare
  return `${routeName} — Stop #${stop?.sequence_order ?? index + 1}`;
}

function normalizeStop(stop, index, currentRoute) {
  return {
    id: stop?.id ?? stop?._id ?? index + 1,
    row: stop?.sequence_order ?? index + 1,
    location: resolveStopLocation(stop, index, currentRoute),
    eta: stop?.estimated_arrival ?? stop?.eta ?? null,
    status:
      stop?.is_collected || String(stop?.status).toLowerCase() === "collected"
        ? "collected"
        : String(stop?.status).toLowerCase() === "issue"
        ? "issue"
        : "pending",
    issueReason: stop?.issue_reason ?? null,
    coords: getStopCoords(stop), // Original coordinates safe hain maps/directions ke liye
    raw: stop,
  };
}

/* ------------------------------------------------------------------ */
/* Main Dashboard Component                                           */
/* ------------------------------------------------------------------ */
export default function WorkerDashboard() {
  const [userName, setUserName] = useState("Worker");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("route");

  // Route & Stops States
  const [routesList, setRoutesList] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(true);
  const [routeError, setRouteError] = useState(null);

  const [stops, setStops] = useState([]);
  const [stopsLoading, setStopsLoading] = useState(false);
  const [stopsError, setStopsError] = useState(null);

  // Concern Assignments State
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

  // UI States
  const [mapOpen, setMapOpen] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [issueModalStop, setIssueModalStop] = useState(null);
  const [submittingIssue, setSubmittingIssue] = useState(false);

  // 1. Resolve User Profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        let current = null;
        if (typeof authService?.getCurrentUser === "function") {
          current = await authService.getCurrentUser();
        }
        if (!current) {
          const stored = localStorage.getItem("user");
          current = stored ? JSON.parse(stored) : null;
        }
        const name = current?.full_name ?? current?.name ?? current?.email;
        const uid = current?.id ?? current?.user_id ?? current?._id;
        if (name) setUserName(name);
        if (uid != null) setCurrentUserId(Number(uid));
      } catch (e) {
        console.error("Worker load user error:", e);
      }
    };
    fetchUser();
  }, []);

  // 2. Fetch Assigned Routes
  const loadRoutes = useCallback(async () => {
    setRouteLoading(true);
    setRouteError(null);
    try {
      const routes = await workerService.getAllAssignedRoutes();
      const list = Array.isArray(routes) ? routes : [];
      setRoutesList(list);
      if (list.length > 0) {
        setSelectedRoute((prev) =>
          prev ? list.find((r) => r.id === prev.id) || list[0] : list[0]
        );
      } else {
        setSelectedRoute(null);
      }
    } catch (err) {
      setRouteError("Failed to load your assigned collection routes.");
    } finally {
      setRouteLoading(false);
    }
  }, []);

  // 3. Fetch Stops for Selected Route (selectedRoute pass kiya normalizeStop me)
  const loadStops = useCallback(async () => {
    const routeId = selectedRoute?.id ?? selectedRoute?.route_id;
    if (!routeId) {
      setStops([]);
      return;
    }
    setStopsLoading(true);
    setStopsError(null);
    try {
      const rawPoints = await workerService.getRouteStops(routeId);
      const list = Array.isArray(rawPoints) ? rawPoints : [];
      setStops(list.map((stop, idx) => normalizeStop(stop, idx, selectedRoute)));
    } catch (err) {
      setStopsError("Failed to load collection stops for this route.");
    } finally {
      setStopsLoading(false);
    }
  }, [selectedRoute]);

  // 4. Fetch Assignments
  const loadAssignments = useCallback(async () => {
    setAssignmentsLoading(true);
    try {
      const [rawAssignments, rawConcerns] = await Promise.allSettled([
        assignmentService.getAssignments(),
        concernService.getAllConcerns(),
      ]);

      const assignmentList =
        rawAssignments.status === "fulfilled" && Array.isArray(rawAssignments.value)
          ? rawAssignments.value
          : [];

      const concernList =
        rawConcerns.status === "fulfilled" && Array.isArray(rawConcerns.value)
          ? rawConcerns.value
          : [];

      const workerAssignments = assignmentList.filter((a) => {
        if (!currentUserId) return true;
        const wId = a.worker_id ?? a.user_id;
        return wId ? Number(wId) === Number(currentUserId) : true;
      });

      const mapped = workerAssignments.map((a) => {
        const matchingConcern = concernList.find(
          (c) => c.id === a.concern_id || c.id === a.point_id
        );
        return {
          id: a.id,
          concern_id: a.concern_id || matchingConcern?.id,
          title: matchingConcern?.title || a.title || `Work Order #${a.id}`,
          description:
            matchingConcern?.description ||
            a.description ||
            "Assigned citizen concern",
          location:
            typeof matchingConcern?.location === "object"
              ? coordsToLocationString(
                  matchingConcern.location.latitude,
                  matchingConcern.location.longitude
                )
              : matchingConcern?.location || a.location || "Assigned Location",
          status: (a.status || "pending").toLowerCase(),
          date: a.created_at
            ? new Date(a.created_at).toLocaleDateString()
            : "Today",
        };
      });

      setAssignments(mapped);
    } catch (e) {
      setAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadRoutes();
    loadAssignments();
  }, [loadRoutes, loadAssignments]);

  useEffect(() => {
    loadStops();
  }, [loadStops]);

  // 5. Dynamic Counts
  const completedStops = useMemo(
    () => stops.filter((s) => s.status === "collected").length,
    [stops]
  );

  const activeAssignedConcernsCount = useMemo(
    () =>
      assignments.filter(
        (a) => a.status !== "completed" && a.status !== "resolved"
      ).length,
    [assignments]
  );

  const issuesReportedCount = useMemo(
    () => stops.filter((s) => s.status === "issue").length,
    [stops]
  );

  // 6. Actions
  const handleMarkDone = async (stop) => {
    if (!stop.id || actionLoadingId) return;
    setActionLoadingId(stop.id);
    try {
      await workerService.markStopCollected(stop.id);
      setStops((prev) =>
        prev.map((s) =>
          s.id === stop.id
            ? { ...s, status: "collected", issueReason: null }
            : s
        )
      );
    } catch (err) {
      console.error("Failed to mark stop as collected:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSubmitIssue = async (reason) => {
    if (!issueModalStop || !reason) return;
    setSubmittingIssue(true);
    try {
      const locStr = issueModalStop.coords
        ? `${Number(issueModalStop.coords.lat).toFixed(6)}, ${Number(
            issueModalStop.coords.lng
          ).toFixed(6)}`
        : String(issueModalStop.location || "0.0, 0.0");

      await workerService.reportStopIssue({
        title: `Pickup Issue - Stop #${issueModalStop.row}`,
        category: "missed_pickup",
        description: `Stop #${issueModalStop.row} (${issueModalStop.location}): ${reason}`,
        location: locStr,
        priority: "high",
      });

      setStops((prev) =>
        prev.map((s) =>
          s.id === issueModalStop.id
            ? { ...s, status: "issue", issueReason: reason }
            : s
        )
      );
      setIssueModalStop(null);
    } catch (err) {
      if (err?.response?.status === 409) {
        setStops((prev) =>
          prev.map((s) =>
            s.id === issueModalStop.id
              ? { ...s, status: "issue", issueReason: reason }
              : s
          )
        );
        setIssueModalStop(null);
      } else {
        console.error("Failed to submit issue:", err?.response?.data || err);
      }
    } finally {
      setSubmittingIssue(false);
    }
  };

  const handleUpdateAssignmentStatus = async (assignmentId, nextStatus) => {
    try {
      await assignmentService.updateAssignmentStatus(assignmentId, nextStatus);
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId ? { ...a, status: nextStatus } : a
        )
      );
    } catch (err) {
      console.error("Failed to update assignment status:", err);
    }
  };

  const handleCompleteConcern = async (assignmentId, concernId) => {
    try {
      if (concernId) {
        await concernService.updateConcernStatus(concernId, "resolved");
      }
      await assignmentService.updateAssignmentStatus(assignmentId, "completed");
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId ? { ...a, status: "completed" } : a
        )
      );
    } catch (err) {
      console.error("Failed to complete concern work order:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-100/30 pb-12">
      <WorkerHeader userName={userName} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Metric Strip */}
        <WorkerMetricStrip
          completedStops={completedStops}
          totalStops={stops.length}
          assignedConcernsCount={activeAssignedConcernsCount}
          issuesReportedCount={issuesReportedCount}
          shiftStatus="Active"
        />

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200/80 w-fit mb-6 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("route")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "route"
                ? "bg-[#0B3D2E] text-white shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Navigation className="w-3.5 h-3.5" /> Daily Collection Route
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("concerns")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "concerns"
                ? "bg-[#0B3D2E] text-white shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" /> Assigned Concerns (
            {activeAssignedConcernsCount})
          </button>
        </div>

        {/* Tab 1: Collection Route & Map */}
        {activeTab === "route" && (
          <>
            {routeLoading ? (
              <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-white/60 shadow-xl p-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <p className="text-xs font-semibold text-gray-600">
                  Loading assigned collection routes…
                </p>
              </div>
            ) : routeError ? (
              <div className="rounded-3xl bg-red-50/80 border border-red-200 shadow-xl p-10 flex flex-col items-center justify-center gap-3 text-center">
                <p className="font-semibold text-xs text-red-700">
                  {routeError}
                </p>
                <button
                  type="button"
                  onClick={loadRoutes}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 transition shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            ) : !selectedRoute ? (
              <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-white/60 shadow-xl p-12 flex flex-col items-center justify-center gap-2 text-center text-gray-500">
                <Inbox className="w-8 h-8 text-gray-400 mb-1" />
                <p className="font-semibold text-sm text-[#0B3D2E]">
                  No route is currently assigned to you.
                </p>
                <p className="text-xs text-gray-400">
                  Please check back once your admin assigns a route.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <WorkerRouteSummary
                  routes={routesList}
                  selectedRoute={selectedRoute}
                  onSelectRoute={(r) => setSelectedRoute(r)}
                  completedStops={completedStops}
                  totalStops={stops.length}
                />

                <WorkerStopsTable
                  stops={stops}
                  loading={stopsLoading}
                  error={stopsError}
                  onRetry={loadStops}
                  onMarkDone={handleMarkDone}
                  onOpenIssueModal={(s) => setIssueModalStop(s)}
                  actionLoadingId={actionLoadingId}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Live Navigation Map
                    </h3>
                    <button
                      type="button"
                      onClick={() => setMapOpen((v) => !v)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition shadow-xs"
                    >
                      <MapIcon className="w-3.5 h-3.5 text-emerald-600" />
                      {mapOpen ? "Hide Route Map" : "Open Route Map"}
                    </button>
                  </div>
                  {mapOpen && <WorkerRouteMap stops={stops} />}
                </div>
              </div>
            )}
          </>
        )}

        {/* Tab 2: Assigned Concerns */}
        {activeTab === "concerns" && (
          <WorkerAssignmentsView
            assignments={assignments}
            loading={assignmentsLoading}
            onUpdateStatus={handleUpdateAssignmentStatus}
            onCompleteConcern={handleCompleteConcern}
          />
        )}
      </main>

      {/* Report Issue Modal */}
      <ReportIssueModal
        stop={issueModalStop}
        onClose={() => setIssueModalStop(null)}
        onSubmit={handleSubmitIssue}
        submitting={submittingIssue}
      />

      <FloatingChatbot />
    </div>
  );
}