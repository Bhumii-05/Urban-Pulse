import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Search,
  MapPin,
  Route as RouteIcon,
  Check,
  Eye,
  XCircle,
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

export default function SuggestionManagement({ fireToast, onImportToRoute }) {
  // Defensive state initialization
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionSearch, setSuggestionSearch] = useState("");
  const [suggestionStatusFilter, setSuggestionStatusFilter] = useState("All");

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

  // Safe Guarded Filter Memo
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

  const handleUpdateSuggestionStatus = async (suggestionId, statusEnum) => {
    try {
      await suggestionService.updateSuggestionStatus(suggestionId, statusEnum);
      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestionId ? { ...s, status: statusEnum } : s
        )
      );
      if (fireToast) fireToast(`Suggestion marked as ${statusEnum}`);
    } catch (err) {
      if (fireToast) fireToast("Failed to update suggestion status");
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
              Evaluate citizen-submitted waste pick points and approve or reject locations.
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
                <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-gray-50 p-2 rounded-xl mb-4 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>
                    Lat: {coords.lat || "—"}, Lng: {coords.lng || "—"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-gray-50">
                <button
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
                    onClick={() =>
                      handleUpdateSuggestionStatus(s.id, "accepted")
                    }
                    className="flex-1 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateSuggestionStatus(s.id, "reviewed")
                    }
                    className="flex-1 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> Review
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateSuggestionStatus(s.id, "rejected")
                    }
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
    </div>
  );
}