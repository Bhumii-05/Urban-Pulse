import React from "react";
import { X, Trash2 } from "lucide-react";
import { Modal, Field } from "../../common/CommonUI";

export function CreateRouteModal({
  open,
  onClose,
  newRouteForm,
  setNewRouteForm,
  workersList,
  onCreateRoute,
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#0B3D2E]">
          Create Collection Route
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 rounded-full p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <Field label="Route Name">
          <input
            type="text"
            placeholder="e.g., Sector 2 Main Collection Path"
            value={newRouteForm.name}
            onChange={(e) =>
              setNewRouteForm({ ...newRouteForm, name: e.target.value })
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
        </Field>

        <Field label="Description">
          <input
            type="text"
            placeholder="e.g., Daily waste collection"
            value={newRouteForm.description}
            onChange={(e) =>
              setNewRouteForm({ ...newRouteForm, description: e.target.value })
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
        </Field>

        <Field label="Assign Worker">
          <select
            value={newRouteForm.worker_id}
            onChange={(e) =>
              setNewRouteForm({ ...newRouteForm, worker_id: e.target.value })
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 bg-white"
          >
            <option value="">Select a Worker...</option>
            {(workersList || []).map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.email})
              </option>
            ))}
          </select>
        </Field>

        <Field label="Route Date">
          <input
            type="date"
            value={newRouteForm.route_date}
            onChange={(e) =>
              setNewRouteForm({ ...newRouteForm, route_date: e.target.value })
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
        </Field>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onCreateRoute}
          className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
        >
          Create Route
        </button>
      </div>
    </Modal>
  );
}

export function EditRouteModal({ editRoute, setEditRoute, onClose, onSave }) {
  return (
    <Modal open={Boolean(editRoute)} onClose={onClose}>
      {editRoute && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0B3D2E]">
              Edit Route #{editRoute.id}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <Field label="Route Name">
              <input
                type="text"
                value={editRoute.route_name}
                onChange={(e) =>
                  setEditRoute({ ...editRoute, route_name: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
            </Field>

            <Field label="Route Date">
              <input
                type="date"
                value={editRoute.route_date}
                onChange={(e) =>
                  setEditRoute({ ...editRoute, route_date: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
            </Field>
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
              Save Route
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

export function DeleteRouteModal({ routeToDelete, onClose, onConfirm }) {
  return (
    <Modal open={Boolean(routeToDelete)} onClose={onClose} narrow>
      {routeToDelete && (
        <div className="text-center py-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-red-600 mx-auto">
              Delete Route?
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
              {routeToDelete.route_name ||
                routeToDelete.name ||
                `Route #${routeToDelete.id}`}
            </span>
            ? This will also remove all its collection points.
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