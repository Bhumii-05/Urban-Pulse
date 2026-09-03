import React, { useState, Fragment } from "react";
import {
  ClipboardList,
  AlertCircle,
  RefreshCw,
  Trash2,
  ChevronRight,
  Truck,
  AlertTriangle,
  Wrench,
  Camera,
} from "lucide-react";
import ConcernImageGallery from "../report-concern/ConcernImageGallery";

const CONCERN_STATUS_STYLES = {
  open: { label: "Open", badge: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200", dot: "bg-blue-500" },
  pending: { label: "Pending", badge: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200", dot: "bg-rose-500" },
  assigned: { label: "Assigned", badge: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200", dot: "bg-amber-500" },
  resolved: { label: "Resolved", badge: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200", dot: "bg-emerald-500" },
  closed: { label: "Closed", badge: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200", dot: "bg-slate-400" },
};

const PRIORITY_STYLES = {
  low: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
  medium: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  high: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
  critical: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  urgent: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
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

function formatDate(isoString) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function getCategoryIcon(category) {
  const key = String(category || "").toLowerCase();
  if (key.includes("overflow")) return Trash2;
  if (key.includes("pickup") || key.includes("missed")) return Truck;
  if (key.includes("dump") || key.includes("illegal")) return AlertTriangle;
  if (key.includes("damage") || key.includes("broken")) return Wrench;
  return ClipboardList;
}

export default function CitizenConcernsTable({
  concerns,
  loading,
  error,
  onRetry,
  onSelectDelete,
}) {
  const [expandedConcernId, setExpandedConcernId] = useState(null);

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-emerald-600" />
        <h2 className="text-lg font-bold text-slate-900">My Concerns List</h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {error ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <p className="text-sm font-medium text-slate-700">Unable to load your concerns.</p>
            <button
              onClick={onRetry}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-3 p-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : concerns.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <ClipboardList className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No concerns reported yet.</p>
            <p className="text-xs text-slate-400">Concerns you report will show up here.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500">
                    <th className="pl-12 pr-5 py-3 font-medium text-left">Category</th>
                    <th className="px-5 py-3 font-medium text-left">Reported Date</th>
                    <th className="px-5 py-3 font-medium text-left">Priority</th>
                    <th className="px-5 py-3 font-medium text-left">Status</th>
                    <th colSpan={2} className="pl-5 pr-12 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {concerns.map((concern) => {
                    const concernId = concern.id || concern._id;
                    const statusKey = String(concern.status || "").toLowerCase();
                    const statusStyle = CONCERN_STATUS_STYLES[statusKey] || {
                      label: toTitleCase(concern.status),
                      badge: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
                      dot: "bg-slate-400",
                    };
                    const CategoryIcon = getCategoryIcon(concern.category);
                    const canDelete = DELETABLE_STATUSES.includes(statusKey);
                    const isExpanded = expandedConcernId === concernId;
                    const hasPhoto = Boolean(concern.image_url || (concern.images && concern.images.length > 0));

                    return (
                      <Fragment key={concernId}>
                        <tr className="transition hover:bg-slate-50/60">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <CategoryIcon className="h-4 w-4" />
                              </span>
                              <span className="font-medium text-slate-800">
                                {toTitleCase(concern.category || "General")}
                              </span>
                              {hasPhoto && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-1.5 py-0.5 text-[11px] font-medium text-sky-700 ring-1 ring-inset ring-sky-600/20">
                                  <Camera className="h-3 w-3 text-sky-600" />
                                  Photo
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {formatDate(concern.created_at)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                                PRIORITY_STYLES[String(concern.priority).toLowerCase()] ||
                                "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"
                              }`}
                            >
                              {concern.priority || "N/A"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle.badge}`}>
                              {statusStyle.dot && <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />}
                              {statusStyle.label}
                            </span>
                          </td>

                          {/* View Action */}
                          <td className="pl-5 pr-2 py-3.5 text-right">
                            <button
                              onClick={() => setExpandedConcernId(isExpanded ? null : concernId)}
                              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 ml-auto"
                            >
                              View
                              <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                            </button>
                          </td>

                          {/* Delete Action (Rightmost) */}
                          <td className="pl-1 pr-12 py-3 text-right w-10">
                            {canDelete ? (
                              <button
                                onClick={() => onSelectDelete(concern)}
                                aria-label="Delete concern"
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 inline-block"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : (
                              <span className="inline-block w-7" />
                            )}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-slate-50/60">
                            <td colSpan={6} className="px-5 py-4 text-sm text-slate-600">
                              <div className="space-y-3">
                                <div>
                                  <span className="font-medium text-slate-700">Description & Details: </span>
                                  {concern.description || "No additional description provided."}
                                </div>
                                <ConcernImageGallery concernId={concernId} />
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

            {/* Mobile View */}
            <div className="divide-y divide-slate-100 sm:hidden">
              {concerns.map((concern) => {
                const concernId = concern.id || concern._id;
                const statusKey = String(concern.status || "").toLowerCase();
                const statusStyle = CONCERN_STATUS_STYLES[statusKey] || {
                  label: toTitleCase(concern.status),
                  badge: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
                  dot: "bg-slate-400",
                };
                const CategoryIcon = getCategoryIcon(concern.category);
                const canDelete = DELETABLE_STATUSES.includes(statusKey);
                const isExpanded = expandedConcernId === concernId;
                const hasPhoto = Boolean(concern.image_url || (concern.images && concern.images.length > 0));

                return (
                  <div key={concernId} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <CategoryIcon className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-800">{toTitleCase(concern.category || "General")}</p>
                            {hasPhoto && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 ring-1 ring-inset ring-sky-600/20">
                                <Camera className="h-2.5 w-2.5 text-sky-600" />
                                Photo
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">{formatDate(concern.created_at)}</span>
                        </div>
                      </div>

                      {/* Mobile Actions: View first, then Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setExpandedConcernId(isExpanded ? null : concernId)}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                        >
                          View
                          <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        </button>

                        {canDelete && (
                          <button
                            onClick={() => onSelectDelete(concern)}
                            aria-label="Delete concern"
                            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle.badge}`}>
                        {statusStyle.dot && <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />}
                        {statusStyle.label}
                      </span>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${PRIORITY_STYLES[String(concern.priority).toLowerCase()] || "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"}`}>
                        {concern.priority || "N/A"}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
                        <p className="text-xs">
                          <span className="font-medium text-slate-700">Description & Details: </span>
                          {concern.description || "No additional description provided."}
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
  );
}