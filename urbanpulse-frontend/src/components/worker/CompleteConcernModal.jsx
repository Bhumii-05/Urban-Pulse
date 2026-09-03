import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Camera, Upload, X, Loader2 } from "lucide-react";
import { concernService } from "../../api/concern.service";

export default function CompleteConcernModal({
  assignment,
  onClose,
  onCompleted,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!assignment) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleCompleteWithEvidence = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const concernId = assignment.concern_id || assignment.id;
      
      // 1. Upload resolution evidence photo if provided
      if (selectedFile && concernId) {
        await concernService.uploadConcernImage(concernId, selectedFile);
      }
      
      // 2. Trigger parent completion hook
      await onCompleted(assignment.id, concernId);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Failed to complete work order and upload evidence."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4 animate-scaleIn">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-[#0B3D2E] font-bold text-sm">Complete Work Order</h3>
              <p className="text-gray-400 text-[11px] truncate max-w-[220px]">
                {assignment.title || `Task #${assignment.id}`}
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

        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-600">
            Please attach a photo demonstrating resolution (e.g. cleared waste or replaced bin) before closing this task.
          </p>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {previewUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-gray-200">
              <img src={previewUrl} alt="Evidence preview" className="w-full h-44 object-cover" />
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-36 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/40 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold">Take Photo or Browse Image</span>
            </button>
          )}

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

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
              onClick={handleCompleteWithEvidence}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              Submit & Complete
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}