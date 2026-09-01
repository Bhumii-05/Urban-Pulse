import React from "react";
import { X, Trash2 } from "lucide-react";
import { Modal } from "../../common/CommonUI";

export function EditPointModal({
  editPoint,
  editPointForm,
  setEditPointForm,
  onClose,
  onSave,
}) {
  return (
    <Modal open={Boolean(editPoint)} onClose={onClose}>
      {editPoint && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-mono text-gray-400">
                Stop #{editPoint.id}
              </span>
              <h2 className="text-lg font-bold text-[#0B3D2E]">
                Edit Collection Point
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={editPointForm.latitude}
                  onChange={(e) =>
                    setEditPointForm({
                      ...editPointForm,
                      latitude: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={editPointForm.longitude}
                  onChange={(e) =>
                    setEditPointForm({
                      ...editPointForm,
                      longitude: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Sequence Order
              </label>
              <input
                type="number"
                value={editPointForm.sequence_order}
                onChange={(e) =>
                  setEditPointForm({
                    ...editPointForm,
                    sequence_order: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Assigned Waste Bin UUID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
                value={editPointForm.waste_bin_id}
                onChange={(e) =>
                  setEditPointForm({
                    ...editPointForm,
                    waste_bin_id: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
            >
              Save Changes
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

export function DeletePointModal({ pointToDelete, onClose, onConfirm }) {
  return (
    <Modal open={Boolean(pointToDelete)} onClose={onClose} narrow>
      {pointToDelete && (
        <div className="text-center py-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-red-600 mx-auto">
              Delete Collection Point?
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 absolute right-6 top-6"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto my-4">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-sm text-gray-500 px-2 mb-7">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-700">
              Stop #{pointToDelete.id} (Seq #{pointToDelete.sequence_order})
            </span>{" "}
            from this route?
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Confirm Delete
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}