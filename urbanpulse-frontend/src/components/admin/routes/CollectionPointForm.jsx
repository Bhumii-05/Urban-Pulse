import React from "react";
import { MousePointerClick, Save } from "lucide-react";

// Local helper to calculate the next sequence number safely
function calculateNextSequence(points = []) {
  if (!Array.isArray(points) || points.length === 0) return 1;
  const maxSeq = points.reduce((max, p) => {
    const seq = parseInt(p?.sequence_order, 10);
    return !isNaN(seq) && seq > max ? seq : max;
  }, 0);
  return maxSeq + 1;
}

export default function CollectionPointForm({
  isCreatingPoint = false,
  setIsCreatingPoint,
  newPointForm = {},
  setNewPointForm,
  onSubmitPoint,
  routePoints = [],
}) {
  const nextSeq = calculateNextSequence(routePoints);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#0B3D2E] uppercase tracking-wider">
          Add Collection Point
        </h3>
        <button
          type="button"
          onClick={() => setIsCreatingPoint?.((prev) => !prev)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            isCreatingPoint
              ? "bg-amber-100 text-amber-800 border border-amber-300 ring-2 ring-amber-400/20"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
          }`}
        >
          <MousePointerClick className="w-3.5 h-3.5" />
          {isCreatingPoint ? "Click Map to Plot" : "Pick from Map"}
        </button>
      </div>

      <div className="space-y-3">
        {/* Coordinates Inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-medium text-gray-500 block mb-1">
              Latitude
            </label>
            <input
              type="text"
              placeholder="e.g. 22.5726"
              value={newPointForm.latitude || ""}
              onChange={(e) =>
                setNewPointForm?.((prev) => ({
                  ...prev,
                  latitude: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-gray-500 block mb-1">
              Longitude
            </label>
            <input
              type="text"
              placeholder="e.g. 88.3639"
              value={newPointForm.longitude || ""}
              onChange={(e) =>
                setNewPointForm?.((prev) => ({
                  ...prev,
                  longitude: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </div>
        </div>

        {/* Sequence Order Input */}
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1">
            Sequence Order (Optional)
          </label>
          <input
            type="number"
            placeholder={`Auto (Next: #${nextSeq})`}
            value={newPointForm.sequence_order || ""}
            onChange={(e) =>
              setNewPointForm?.((prev) => ({
                ...prev,
                sequence_order: e.target.value,
              }))
            }
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
        </div>

        {/* Waste Bin UUID Input */}
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1">
            Waste Bin ID (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. BIN-01 or UUID"
            value={newPointForm.waste_bin_id || ""}
            onChange={(e) =>
              setNewPointForm?.((prev) => ({
                ...prev,
                waste_bin_id: e.target.value,
              }))
            }
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={onSubmitPoint}
          className="w-full py-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-semibold shadow-md shadow-emerald-900/10 flex items-center justify-center gap-1.5 transition-all"
        >
          <Save className="w-3.5 h-3.5" /> Save Collection Point
        </button>
      </div>
    </div>
  );
}