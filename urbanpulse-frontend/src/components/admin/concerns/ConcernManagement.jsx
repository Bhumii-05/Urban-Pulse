import React, { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  Search,
  Eye,
  Route as RouteIcon,
  CheckCircle2,
  Image as ImageIcon,
  UserCheck,
  X,
} from "lucide-react";
import { concernService } from "../../../api/concern.service";
import { userService } from "../../../api/admin.service";
import { coordsToLocationString } from "../../../api/location.service";
import { getCategoryLabel } from "../../../api/concernConfig";
import { PriorityBadge, Modal } from "../../common/CommonUI";
import AssignWorkerModal from "../assignments/AssignWorkerModal";

const CONCERN_STATUS_FILTERS = ["All", "Pending", "Resolved"];

function parseCoordinates(loc) {
  if (!loc) return null;
  if (typeof loc === "object") {
    const lat = loc.latitude ?? loc.lat;
    const lng = loc.longitude ?? loc.lng;
    if (lat != null && lng != null)
      return { lat: Number(lat), lng: Number(lng) };
  } else if (typeof loc === "string" && loc.includes(",")) {
    const [lat, lng] = loc.split(",").map((v) => Number(v.trim()));
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return null;
}

function formatLocation(loc) {
  const coords = parseCoordinates(loc);
  if (coords)
    return coordsToLocationString(coords.lat.toFixed(4), coords.lng.toFixed(4));
  return typeof loc === "string" ? loc : "—";
}

function formatDate(dateString) {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return String(dateString);
  }
}

export default function ConcernManagement({
  fireToast,
  onImportToRoute,
  refreshAnalytics,
}) {
  const [concerns, setConcerns] = useState([]);
  const [concernSearch, setConcernSearch] = useState("");
  const [concernStatusFilter, setConcernStatusFilter] = useState("All");

  const [workersList, setWorkersList] = useState([]);
  const [assignItem, setAssignItem] = useState(null);

  const [viewConcern, setViewConcern] = useState(null);
  const [concernImages, setConcernImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const fetchConcerns = async () => {
    try {
      const data = await concernService.getAllConcerns();
      const list = Array.isArray(data) ? data : data?.concerns || [];
      setConcerns(list);
    } catch (err) {
      setConcerns([]);
      if (fireToast) fireToast("Failed to load concerns");
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await userService.getAllUsers();
      const users = Array.isArray(res) ? res : res?.users || [];
      const workers = users
        .filter((u) => (u.role || "").toLowerCase() === "worker")
        .map((w) => ({
          id: w.id || w._id,
          name: w.full_name || w.name || "Worker",
          email: w.email,
        }));
      setWorkersList(workers);
    } catch (e) {
      setWorkersList([]);
    }
  };

  useEffect(() => {
    fetchConcerns();
    fetchWorkers();
  }, []);

  const filteredConcerns = useMemo(() => {
    const list = Array.isArray(concerns) ? concerns : [];
    return list.filter((c) => {
      const categoryLabel = getCategoryLabel(c.category) || "";
      const matchesSearch =
        (c.title || "").toLowerCase().includes(concernSearch.toLowerCase()) ||
        categoryLabel.toLowerCase().includes(concernSearch.toLowerCase()) ||
        (c.id || "").toString().includes(concernSearch);

      const currentStatus = (c.status || "Pending").toLowerCase();
      const filterStatus = concernStatusFilter.toLowerCase();
      const normalizedStatus =
        currentStatus === "open" ? "pending" : currentStatus;
      const matchesStatus =
        filterStatus === "all" || normalizedStatus === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [concerns, concernSearch, concernStatusFilter]);

  const openViewConcern = async (concern) => {
    setViewConcern(concern);
    setLoadingImages(true);
    try {
      const data = await concernService.getConcernImages(concern.id);
      const fetchedImages = Array.isArray(data) ? data : data?.images || [];
      if (fetchedImages.length === 0 && (concern.image_url || concern.images)) {
        const fallbackList = concern.image_url
          ? [concern.image_url]
          : Array.isArray(concern.images)
          ? concern.images
          : [];
        setConcernImages(fallbackList);
      } else {
        setConcernImages(fetchedImages);
      }
    } catch (err) {
      setConcernImages(concern.image_url ? [concern.image_url] : []);
    } finally {
      setLoadingImages(false);
    }
  };

  const updateConcernStatus = async (concernId, newStatus) => {
    try {
      await concernService.updateConcernStatus(
        concernId,
        newStatus.toLowerCase()
      );
      setConcerns((prev) =>
        prev.map((c) => (c.id === concernId ? { ...c, status: newStatus } : c))
      );
      if (viewConcern && viewConcern.id === concernId) {
        setViewConcern((prev) => ({ ...prev, status: newStatus }));
      }
      if (fireToast) fireToast(`Concern status updated to ${newStatus}`);
      if (refreshAnalytics) refreshAnalytics();
    } catch (err) {
      if (fireToast) fireToast("Failed to update concern status");
    }
  };

  return (
    <div className="relative bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl ring-1 ring-white/60 border border-white/40 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0B3D2E]">
              Concerns Management
            </h1>
            <p className="text-sm text-gray-500">
              Inspect citizen reports, dispatch workers, and view proof of resolution.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 mb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={concernSearch}
            onChange={(e) => setConcernSearch(e.target.value)}
            placeholder="Search concerns..."
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white rounded-xl p-1 border border-gray-200 w-fit">
          {CONCERN_STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setConcernStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                concernStatusFilter === s
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left font-semibold px-5 py-3">ID</th>
                <th className="text-left font-semibold px-5 py-3">Category</th>
                <th className="text-left font-semibold px-5 py-3">Location</th>
                <th className="text-left font-semibold px-5 py-3">Reported Date</th>
                <th className="text-left font-semibold px-5 py-3">Priority</th>
                <th className="text-left font-semibold px-5 py-3">Status</th>
                <th className="w-[320px] min-w-[320px] text-center font-semibold px-5 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredConcerns.map((c) => {
                const isResolved = (c.status || "").toLowerCase() === "resolved";
                const locationDisplay = formatLocation(c.location);

                return (
                  <tr
                    key={c.id}
                    className="border-t border-gray-100 hover:bg-amber-50/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                      #{c.id}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      {getCategoryLabel(c.category) || c.title || `Concern #${c.id}`}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">
                      {locationDisplay}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {formatDate(c.reported_date || c.created_at || c.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isResolved
                            ? "bg-emerald-100 text-emerald-700"
                            : c.status?.toLowerCase() === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {c.status || "Pending"}
                      </span>
                    </td>
                    <td className="w-[320px] min-w-[320px] px-5 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* 1. View Details (contains evidence photos) */}
                        <button
                          type="button"
                          onClick={() => openViewConcern(c)}
                          className="flex items-center gap-1 text-xs font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg transition-colors"
                          title="View Concern Details & Photos"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>

                        {/* 2. Assign Worker */}
                        {!isResolved && (
                          <button
                            type="button"
                            onClick={() =>
                              setAssignItem({
                                id: c.id,
                                title: getCategoryLabel(c.category) || `Concern #${c.id}`,
                                location: locationDisplay,
                                type: "concern",
                              })
                            }
                            className="flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors"
                            title="Dispatch this concern to a worker"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-emerald-700" /> Assign
                          </button>
                        )}

                        {/* 3. Add to Route */}
                        {onImportToRoute && (
                          <button
                            type="button"
                            onClick={() => {
                              const coords = parseCoordinates(c.location);
                              onImportToRoute(
                                getCategoryLabel(c.category) || `Concern #${c.id}`,
                                coords
                              );
                            }}
                            className="flex items-center gap-1 text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
                            title="Add this concern's location to the active route"
                          >
                            <RouteIcon className="w-3.5 h-3.5" /> Route
                          </button>
                        )}

                        {/* 4. Resolve */}
                        {!isResolved && (
                          <button
                            type="button"
                            onClick={() => updateConcernStatus(c.id, "Resolved")}
                            className="flex items-center gap-1 text-xs font-medium text-emerald-600 border border-emerald-200 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredConcerns.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-gray-400 text-sm"
                  >
                    No concerns match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Concern Detail Modal */}
      <Modal open={Boolean(viewConcern)} onClose={() => setViewConcern(null)}>
        {viewConcern && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-mono text-gray-400">
                  #{viewConcern.id}
                </span>
                <h2 className="text-lg font-bold text-[#0B3D2E]">
                  {getCategoryLabel(viewConcern.category) ||
                    viewConcern.title ||
                    `Concern #${viewConcern.id}`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewConcern(null)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  <strong className="text-gray-800">Status:</strong>{" "}
                  <span className="font-semibold text-amber-700">
                    {viewConcern.status || "Pending"}
                  </span>
                </span>
                <div>
                  <strong className="text-gray-800 mr-1.5">Priority:</strong>
                  <PriorityBadge priority={viewConcern.priority} />
                </div>
              </div>

              <p className="text-gray-600">
                <strong className="text-gray-800">Location:</strong>{" "}
                <span className="font-mono">{formatLocation(viewConcern.location)}</span>
              </p>

              <p className="text-gray-600">
                <strong className="text-gray-800">Reported Date:</strong>{" "}
                {formatDate(
                  viewConcern.reported_date ||
                    viewConcern.created_at ||
                    viewConcern.date
                )}
              </p>

              {viewConcern.description && (
                <p className="text-gray-600">
                  <strong className="text-gray-800">Description:</strong>{" "}
                  {viewConcern.description}
                </p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3 mb-5">
              <h4 className="text-xs font-semibold text-gray-700 mb-2.5 flex items-center gap-1">
                <ImageIcon className="w-4 h-4 text-amber-600" /> Evidence Photos
              </h4>
              {loadingImages ? (
                <p className="text-xs text-gray-400">Loading images...</p>
              ) : concernImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {concernImages.map((img, idx) => {
                    const imageUrl =
                      typeof img === "string"
                        ? img
                        : img.image_url || img.url || img.file_path;
                    return (
                      <img
                        key={img.id || idx}
                        src={imageUrl}
                        alt="Concern proof"
                        className="w-full h-28 object-cover rounded-xl border border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/150?text=Image+Unavailable";
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No images attached.</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {viewConcern.status?.toLowerCase() !== "resolved" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const item = {
                        id: viewConcern.id,
                        title:
                          getCategoryLabel(viewConcern.category) ||
                          `Concern #${viewConcern.id}`,
                        location: formatLocation(viewConcern.location),
                        type: "concern",
                      };
                      setViewConcern(null);
                      setAssignItem(item);
                    }}
                    className="flex-1 py-2 bg-emerald-50 text-emerald-800 font-medium text-xs rounded-xl border border-emerald-200 hover:bg-emerald-100 transition"
                  >
                    Assign Worker
                  </button>
                  <button
                    type="button"
                    onClick={() => updateConcernStatus(viewConcern.id, "Resolved")}
                    className="flex-1 py-2 bg-emerald-600 text-white font-medium text-xs rounded-xl hover:bg-emerald-700 transition"
                  >
                    Mark Resolved
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setViewConcern(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-600 font-medium text-xs rounded-xl hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Worker Assignment Modal */}
      {assignItem && (
        <AssignWorkerModal
          targetItem={assignItem}
          workersList={workersList}
          onClose={() => setAssignItem(null)}
          onSuccess={() => {
            fetchConcerns();
            if (refreshAnalytics) refreshAnalytics();
          }}
          fireToast={fireToast}
        />
      )}
    </div>
  );
}