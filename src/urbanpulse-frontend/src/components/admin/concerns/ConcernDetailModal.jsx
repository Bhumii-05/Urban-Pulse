/**
 * Project Name: UrbanPulse
 * Group Name: Vision Crafters
 * Author(s): Ashish Pant, Sneha Kesharwani
 * Date of Last Modification: 14 September 2026
 * Brief Description: Displays detailed information about a selected citizen concern.
 */
import React from "react";
import { X, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { Modal, PriorityBadge } from "../../common/CommonUI";
import { getCategoryLabel } from "../../../api/concernConfig";

export default function ConcernDetailModal({
  concern,
  latestAssignment,
  images,
  loadingImages,
  onClose,
  onResolve,
  onReassign,
  formatLocation,
  formatDate,
}) {
  if (!concern) return null;

  const isResolved = (concern.status || "").toLowerCase() === "resolved";
  const assignStatus = String(latestAssignment?.status || "").toLowerCase();

  // Active if assignment was cancelled and concern is not yet resolved
  const hasAssignmentIssue =
    !isResolved &&
    (assignStatus === "cancelled" || Boolean(latestAssignment?.issue_reason));

  const issueReasonText =
    latestAssignment?.issue_reason ||
    latestAssignment?.reason ||
    latestAssignment?.remarks ||
    concern.remarks ||
    "Worker reported an obstacle or access issue preventing collection.";

  const displayStatus = isResolved
    ? "Resolved"
    : hasAssignmentIssue
    ? "Issue Reported"
    : concern.status || "Pending";

  return (
    <Modal open={Boolean(concern)} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-mono text-gray-400">#{concern.id}</span>
          <h2 className="text-lg font-bold text-[#0B3D2E]">
            {getCategoryLabel(concern.category) ||
              concern.title ||
              `Concern #${concern.id}`}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 text-xs mb-5">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 flex items-center gap-1.5">
            <strong className="text-gray-800">Status:</strong>
            <span
              className={`font-semibold px-2.5 py-0.5 rounded-full text-xs ${
                isResolved
                  ? "bg-emerald-100 text-emerald-700"
                  : hasAssignmentIssue
                  ? "bg-red-100 text-red-700"
                  : concern.status?.toLowerCase() === "in_progress"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {displayStatus}
            </span>
          </span>
          <div>
            <strong className="text-gray-800 mr-1.5">Priority:</strong>
            <PriorityBadge priority={concern.priority} />
          </div>
        </div>

        {/* Worker Issue Reason Box: Hides once resolved */}
        {hasAssignmentIssue && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-red-800 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Worker Non-Completion Report</span>
            </div>
            <p className="text-[11px] text-red-700 leading-relaxed pl-5">
              <strong>Reason:</strong> {issueReasonText}
            </p>
          </div>
        )}

        <p className="text-gray-600">
          <strong className="text-gray-800">Location:</strong>{" "}
          <span className="font-mono">{formatLocation(concern.location)}</span>
        </p>

        <p className="text-gray-600">
          <strong className="text-gray-800 font-sans">Reported Date:</strong>{" "}
          {formatDate(
            concern.reported_date || concern.created_at || concern.date
          )}
        </p>

        {concern.description && (
          <p className="text-gray-600">
            <strong className="text-gray-800 font-sans">Description:</strong>{" "}
            {concern.description}
          </p>
        )}
      </div>

      <div className="border-t border-gray-100 pt-4 mb-6">
        <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1">
          <ImageIcon className="w-4 h-4 text-amber-600" /> Evidence Images
        </h4>
        {loadingImages ? (
          <p className="text-xs text-gray-400">Loading images...</p>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {images.map((img, idx) => {
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
        {!isResolved && (
          <>
            {onReassign && (
              <button
                type="button"
                onClick={() =>
                  onReassign({
                    id: concern.id,
                    title:
                      getCategoryLabel(concern.category) ||
                      `Concern #${concern.id}`,
                    location: formatLocation(concern.location),
                    type: "concern",
                  })
                }
                className="flex-1 py-2 bg-amber-50 border border-amber-300 text-amber-800 font-semibold text-xs rounded-xl hover:bg-amber-100 transition"
              >
                {hasAssignmentIssue ? "Reassign Worker" : "Assign Worker"}
              </button>
            )}
            <button
              type="button"
              onClick={() => onResolve(concern.id)}
              className="flex-1 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl hover:bg-emerald-700 transition"
            >
              Mark as Resolved
            </button>
          </>
        )}
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 bg-gray-100 text-gray-600 font-medium text-xs rounded-xl hover:bg-gray-200 transition"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}