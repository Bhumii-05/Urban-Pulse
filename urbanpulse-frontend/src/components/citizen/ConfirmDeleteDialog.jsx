import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2 } from "lucide-react";
import { coordsToLocationString } from "../../api/location.service";

function parseCoordinates(loc) {
  if (!loc) return null;
  if (typeof loc === "object") {
    const lat = loc.latitude ?? loc.lat;
    const lng = loc.longitude ?? loc.lng;
    if (lat != null && lng != null) return { lat: Number(lat), lng: Number(lng) };
  } else if (typeof loc === "string" && loc.includes(",")) {
    const [lat, lng] = loc.split(",").map((v) => Number(v.trim()));
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return null;
}

function formatLocation(loc) {
  if (!loc) return "—";
  const coords = parseCoordinates(loc);
  if (coords) return coordsToLocationString(coords.lat.toFixed(4), coords.lng.toFixed(4));
  if (typeof loc === "object") return loc.address || loc.name || "—";
  return String(loc);
}

export default function ConfirmDeleteDialog({
  concern,
  onCancel,
  onConfirm,
  deleting,
}) {
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
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Delete this concern?</h3>
            <p className="mt-1.5 text-sm text-slate-500">
              You're about to delete{" "}
              <span className="font-medium text-slate-700">
                "{concern.category || concern.title || "Concern"}"
              </span>
              {concern.location && (
                <> at <span className="font-medium text-slate-700">{formatLocation(concern.location)}</span></>
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
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}