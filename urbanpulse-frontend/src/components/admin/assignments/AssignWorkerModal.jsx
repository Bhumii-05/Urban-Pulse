import React, { useState } from "react";
import { createPortal } from "react-dom";
import { UserCheck, X, Send, Loader2, AlertCircle } from "lucide-react";
import { assignmentService } from "../../../api/assignment.service";
import { concernService } from "../../../api/concern.service";

export default function AssignWorkerModal({
  targetItem,
  workersList = [],
  onClose,
  onSuccess,
  fireToast,
}) {
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!targetItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      setError("Please select a sanitation worker.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Send concern_id explicitly as expected by FastAPI schema
      await assignmentService.createAssignment({
        worker_id: parseInt(selectedWorkerId, 10),
        concern_id: parseInt(targetItem.id, 10),
        status: "assigned",
      });

      if (targetItem.type === "concern") {
        try {
          await concernService.updateConcernStatus(targetItem.id, "in_progress");
        } catch (err) {
          // Status update fallback
        }
      }

      if (fireToast) fireToast(`Concern #${targetItem.id} assigned to worker!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail[0]?.msg || "Validation error"
        : typeof detail === "string"
        ? detail
        : "Failed to create worker assignment.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4 animate-scaleIn">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-[#0B3D2E] font-bold text-sm">
                Assign to Sanitation Worker
              </h3>
              <p className="text-gray-400 text-[11px] truncate max-w-[220px]">
                {targetItem.title || `Concern #${targetItem.id}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-full p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Select Sanitation Worker *
            </label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              required
            >
              <option value="">-- Choose an active worker --</option>
              {workersList.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name || w.full_name} ({w.email || `ID: ${w.id}`})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl space-y-1 text-[11px] text-gray-500">
            <p>
              <strong className="text-gray-700">Concern:</strong>{" "}
              {targetItem.title || `Item #${targetItem.id}`}
            </p>
            <p>
              <strong className="text-gray-700">Location:</strong>{" "}
              {targetItem.location || "N/A"}
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedWorkerId}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Confirm Dispatch
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}