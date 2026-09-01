import React, { useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X, Send, Loader2 } from "lucide-react";

const ISSUE_OPTIONS = [
  "House Locked",
  "Waste Not Ready",
  "Road Blocked",
  "Vehicle Issue",
  "Other",
];

export default function ReportIssueModal({ stop, onClose, onSubmit, submitting }) {
  const [selectedReason, setSelectedReason] = useState(ISSUE_OPTIONS[0]);
  const [customDescription, setCustomDescription] = useState("");

  if (!stop) return null;

  const finalReason =
    selectedReason === "Other"
      ? customDescription.trim()
      : selectedReason + (customDescription.trim() ? `: ${customDescription.trim()}` : "");

  const disabled = submitting || (selectedReason === "Other" && !customDescription.trim());

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4 animate-scaleIn">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="text-[#0B3D2E] font-bold text-sm">Report Collection Issue</h3>
              <p className="text-gray-400 text-[11px] truncate max-w-[220px]">{stop.location}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Reason for Non-Collection
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              {ISSUE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {selectedReason === "Other" ? "Detailed Explanation *" : "Additional Notes (Optional)"}
            </label>
            <textarea
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              rows={3}
              placeholder={
                selectedReason === "Other"
                  ? "Describe what prevented the pickup..."
                  : "e.g. Inaccessible due to ongoing road construction..."
              }
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-none"
              disabled={submitting}
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSubmit(finalReason)}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 transition disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Submit Issue
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}