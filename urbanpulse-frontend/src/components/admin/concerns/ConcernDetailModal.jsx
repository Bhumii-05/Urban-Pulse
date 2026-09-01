import React from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { Modal, PriorityBadge } from "../../common/CommonUI";
import { getCategoryLabel } from "../../../api/concernConfig";

export default function ConcernDetailModal({
  concern,
  images,
  loadingImages,
  onClose,
  onResolve,
  formatLocation,
  formatDate,
}) {
  if (!concern) return null;

  return (
    <Modal open={Boolean(concern)} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-mono text-gray-400">#{concern.id}</span>
          <h2 className="text-lg font-bold text-[#0B3D2E]">
            {getCategoryLabel(concern.category) || concern.title || `Concern #${concern.id}`}
          </h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 text-xs mb-5">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">
            <strong className="text-gray-800">Status:</strong>{" "}
            <span className="font-semibold text-amber-700">{concern.status || "Pending"}</span>
          </span>
          <div>
            <strong className="text-gray-800 mr-1.5">Priority:</strong>
            <PriorityBadge priority={concern.priority} />
          </div>
        </div>

        <p className="text-gray-600">
          <strong className="text-gray-800">Location:</strong>{" "}
          <span className="font-mono">{formatLocation(concern.location)}</span>
        </p>

        <p className="text-gray-600">
          <strong className="text-gray-800 font-sans">Reported Date:</strong>{" "}
          {formatDate(concern.reported_date || concern.created_at || concern.date)}
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
              const imageUrl = typeof img === "string" ? img : img.image_url || img.url || img.file_path;
              return (
                <img
                  key={img.id || idx}
                  src={imageUrl}
                  alt="Concern proof"
                  className="w-full h-28 object-cover rounded-xl border border-gray-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=Image+Unavailable";
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
        {concern.status?.toLowerCase() !== "resolved" && (
          <button
            onClick={() => onResolve(concern.id)}
            className="flex-1 py-2 bg-emerald-600 text-white font-medium text-xs rounded-xl hover:bg-emerald-700 transition"
          >
            Mark as Resolved
          </button>
        )}
        <button
          onClick={onClose}
          className="flex-1 py-2 bg-gray-100 text-gray-600 font-medium text-xs rounded-xl hover:bg-gray-200 transition"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}