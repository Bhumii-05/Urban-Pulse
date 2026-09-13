import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  MessageSquare,
  Search,
  MapPin,
  Route as RouteIcon,
  Check,
  Eye,
  XCircle,
  X,
  Send,
  Loader2,
} from "lucide-react";
import { suggestionService } from "../../../api/suggestion.service";

const SUGGESTION_STATUS_FILTERS = [
  "All",
  "Pending",
  "Reviewed",
  "Accepted",
  "Rejected",
];

const getSuggestionStatusBadge = (status = "pending") => {
  const normalized = String(status || "pending").toLowerCase();
  switch (normalized) {
    case "accepted":
    case "approved":
      return {
        label: "Accepted",
        className: "bg-emerald-100 text-emerald-700",
      };
    case "reviewed":
      return { label: "Reviewed", className: "bg-blue-100 text-blue-700" };
    case "rejected":
      return { label: "Rejected", className: "bg-red-100 text-red-700" };
    case "pending":
    default:
      return { label: "Pending", className: "bg-purple-100 text-purple-700" };
  }
};

function ReviewSuggestionModal({
  suggestion,
  initialStatus = "reviewed",
  onClose,
  onSubmit,
  submitting,
}) {
  const [status, setStatus] = useState(initialStatus);
  const [replyText, setReplyText] = useState(suggestion?.admin_reply || "");

  if (!suggestion) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(suggestion.id, status, replyText.trim());
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4 animate-scaleIn">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-purple-700" />
            </div>
            <div>
              <h3 className="text-[#0B3D2E] font-bold text-sm">
                Review Citizen Suggestion
              </h3>
              <p className="text-gray-400 text-[11px] truncate max-w-[220px]">
                {suggestion.title || `Suggestion #${suggestion.id}`}
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
          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 space-y-1">
            <p className="text-xs font-semibold text-gray-800">
              {suggestion.title || `Suggestion #${suggestion.id}`}
            </p>
            <p className="text-[11px] text-gray-600">
              {suggestion.description || "No description provided."}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Decision Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            >
              <option value="accepted">Accept Suggestion</option>
              <option value="reviewed">Mark as Reviewed</option>
              <option value="rejected">Reject Suggestion</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Admin Reply / Feedback (Visible to Citizen)
            </label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              placeholder="e.g. Approved. Added to route schedule / Ho jayega..."
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400/50 resize-none"
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
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Save Review & Reply
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function SuggestionManagement({ fireToast, onImportToRoute }) {
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionSearch, setSuggestionSearch] = useState("");
  const [suggestionStatusFilter, setSuggestionStatusFilter] = useState("All");

  const [reviewModalData, setReviewModalData] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchSuggestions = async () => {
    try {
      const data = await suggestionService.getAllSuggestions();
      const list = Array.isArray(data) ? data : data?.suggestions || [];
      setSuggestions(list);
    } catch (err) {
      setSuggestions([]);
      if (fireToast) fireToast("Failed to fetch citizen suggestions");
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const filteredSuggestions = useMemo(() => {
    const list = Array.isArray(suggestions) ? suggestions : [];
    return list.filter((s) => {
      const matchesSearch =
        (s?.title || "")
          .toLowerCase()
          .includes((suggestionSearch || "").toLowerCase()) ||
        (s?.description || "")
          .toLowerCase()
          .includes((suggestionSearch || "").toLowerCase());

      const currentStatus = String(s?.status || "pending").toLowerCase();
      const filterStatus = suggestionStatusFilter.toLowerCase();
      const matchesStatus =
        filterStatus === "all" || currentStatus === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [suggestions, suggestionSearch, suggestionStatusFilter]);

  const handleOpenReviewModal = (suggestion, initialStatus) => {
    setReviewModalData({
      suggestion,
      initialStatus,
    });
  };

  const handleSaveReview = async (suggestionId, statusEnum, adminReply) => {
    setSubmittingReview(true);
    try {
      const updated = await suggestionService.updateSuggestionStatus(
        suggestionId,
        statusEnum,
        adminReply
      );

      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestionId
            ? {
                ...s,
                status: updated?.status || statusEnum,
                admin_reply:
                  updated?.admin_reply !== undefined
                    ? updated.admin_reply
                    : adminReply,
              }
            : s
        )
      );

      if (fireToast) fireToast(`Suggestion marked as ${statusEnum}`);
      setReviewModalData(null);
    } catch (err) {
      if (fireToast) fireToast("Failed to update suggestion status");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="relative bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl ring-1 ring-white/60 border border-white/40 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0B3D2E]">
              Citizen Suggestions Review
            </h1>
            <p className="text-sm text-gray-500">
              Evaluate citizen-submitted waste pick points, reply with feedback, and approve or reject locations.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4 mb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={suggestionSearch}
            onChange={(e) => setSuggestionSearch(e.target.value)}
            placeholder="Search suggestions..."
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white rounded-xl p-1 border border-gray-200 w-fit">
          {SUGGESTION_STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setSuggestionStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                suggestionStatusFilter === s
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestion Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSuggestions.map((s) => {
          const statusInfo = getSuggestionStatusBadge(s.status);
          const coords = {
            lat: s.latitude ?? s.lat,
            lng: s.longitude ?? s.lng,
          };

          return (
            <div
              key={s.id}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-[#0B3D2E]">
                    {s.title || `Suggestion #${s.id}`}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${statusInfo.className}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  {s.description || "No description provided."}
                </p>

                {/* Display Current Admin Reply If Already Present */}
                {s.admin_reply && (
                  <div className="mb-3 p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-800">
                    <strong className="font-medium">Your reply: </strong>
                    <span>{s.admin_reply}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-gray-50 p-2 rounded-xl mb-4 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>
                    Lat: {coords.lat || "—"}, Lng: {coords.lng || "—"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => {
                    if (onImportToRoute) {
                      onImportToRoute(
                        s.title || `Suggestion #${s.id}`,
                        coords
                      );
                    }
                  }}
                  className="w-full py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                >
                  <RouteIcon className="w-3.5 h-3.5" /> Convert & Add to Route
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenReviewModal(s, "accepted")}
                    className="flex-1 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenReviewModal(s, "reviewed")}
                    className="flex-1 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> Review
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenReviewModal(s, "rejected")}
                    className="flex-1 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredSuggestions.length === 0 && (
          <div className="col-span-2 p-10 text-center text-xs text-gray-400 border border-dashed rounded-2xl bg-gray-50/50">
            No citizen suggestions match your criteria.
          </div>
        )}
      </div>

      {/* Review & Reply Modal */}
      {reviewModalData && (
        <ReviewSuggestionModal
          suggestion={reviewModalData.suggestion}
          initialStatus={reviewModalData.initialStatus}
          onClose={() => setReviewModalData(null)}
          onSubmit={handleSaveReview}
          submitting={submittingReview}
        />
      )}
    </div>
  );
}