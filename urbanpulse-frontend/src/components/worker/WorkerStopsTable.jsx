import React from "react";
import {
  Navigation,
  MapPin,
  CheckCircle,
  AlertTriangle,
  CircleDot,
  Loader2,
  RefreshCw,
  Inbox,
  ExternalLink,
} from "lucide-react";

function StatusBadge({ status, issueReason }) {
  if (status === "collected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700">
        <CheckCircle className="w-3.5 h-3.5" /> Collected
      </span>
    );
  }
  if (status === "issue") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-700">
        <AlertTriangle className="w-3.5 h-3.5" /> Issue Reported
        {issueReason ? ` (${issueReason})` : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700">
      <CircleDot className="w-3.5 h-3.5" /> Pending
    </span>
  );
}

export default function WorkerStopsTable({
  stops = [],
  loading = false,
  error = null,
  onRetry,
  onMarkDone,
  onOpenIssueModal,
  actionLoadingId,
}) {
  const handleOpenGoogleMaps = (coords, locationName) => {
    if (coords && coords.lat && coords.lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`,
        "_blank"
      );
    } else if (locationName) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          locationName
        )}`,
        "_blank"
      );
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-emerald-700" />
          <h2 className="font-bold text-sm text-[#0B3D2E]">Stops Checklist</h2>
        </div>
        <span className="text-xs font-medium text-gray-400">
          Total: {stops.length} Stops
        </span>
      </div>

      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3 text-emerald-800">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <p className="text-xs font-medium text-gray-500">
            Loading collection stops…
          </p>
        </div>
      ) : error ? (
        <div className="p-10 flex flex-col items-center justify-center gap-3 text-center">
          <AlertTriangle className="w-7 h-7 text-red-500" />
          <p className="text-xs font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3.5 py-2 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      ) : stops.length === 0 ? (
        <div className="p-12 flex flex-col items-center justify-center gap-2 text-center text-gray-400">
          <Inbox className="w-8 h-8 text-gray-300 mb-1" />
          <p className="text-xs font-medium text-gray-500">
            No collection stops currently assigned to this route.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 text-[11px] uppercase tracking-wide">
                <th className="px-6 py-3.5 text-left font-semibold">Row</th>
                <th className="px-6 py-3.5 text-left font-semibold">Location</th>
                <th className="px-6 py-3.5 text-left font-semibold">Status</th>
                <th className="w-[280px] min-w-[280px] px-6 py-3.5 text-center font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stops.map((stop) => (
                <tr
                  key={stop.id ?? stop.row}
                  className="hover:bg-emerald-50/40 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-gray-700">
                    #{stop.row}
                  </td>

                  <td className="px-6 py-4 text-gray-800 font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{stop.location}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge
                      status={stop.status}
                      issueReason={stop.issueReason}
                    />
                  </td>

                  <td className="w-[280px] min-w-[280px] px-6 py-4 text-center whitespace-nowrap">
                    {stop.status === "pending" ? (
                      <div className="flex items-center justify-center gap-2">
                        {/* Mark Done Button */}
                        <button
                          type="button"
                          onClick={() => onMarkDone(stop)}
                          disabled={actionLoadingId === stop.id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 transition shadow-xs"
                        >
                          {actionLoadingId === stop.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}
                          Mark Done
                        </button>

                        {/* Report Issue Button */}
                        <button
                          type="button"
                          onClick={() => onOpenIssueModal(stop)}
                          className="inline-flex items-center gap-1 rounded-xl border border-amber-300 text-amber-700 hover:bg-amber-50 text-xs font-semibold px-2.5 py-1.5 transition"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Report Issue
                        </button>

                        {/* GPS Navigation Link */}
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenGoogleMaps(stop.coords, stop.location)
                          }
                          className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition border border-gray-100"
                          title="Navigate via Google Maps"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : stop.status === "collected" ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Pickup Completed
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenGoogleMaps(stop.coords, stop.location)
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium transition"
                          title="View on Google Maps"
                        >
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                          Directions
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          Skipped (Reported)
                        </span>

                        <button
                          type="button"
                          onClick={() => onOpenIssueModal(stop)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium transition"
                        >
                          Update Note
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}