import React from "react";
import { MessageSquare, AlertCircle, RefreshCw, MapPin } from "lucide-react";
import { coordsToLocationString } from "../../api/location.service";

const SUGGESTION_STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
};

function toTitleCase(value) {
  if (!value) return "Unknown";
  return String(value)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(isoString) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function CitizenSuggestionsList({
  suggestions,
  loading,
  error,
  totalCount,
  onRetry,
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">Suggestion History</h2>
        </div>
        {typeof totalCount === "number" && (
          <span className="text-xs font-medium text-slate-400">{totalCount} total</span>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {error ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <p className="text-sm font-medium text-slate-700">Unable to load your suggestions.</p>
            <button
              onClick={onRetry}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-3 p-5">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <MapPin className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No suggestions submitted yet.</p>
            <p className="text-xs text-slate-400">Suggest a new waste pick point to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {suggestions.map((suggestion) => {
              const sugId = suggestion.id || suggestion._id;
              const statusStyle =
                SUGGESTION_STATUS_STYLES[String(suggestion.status).toLowerCase()] ||
                "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";

              return (
                <div key={sugId} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-800">
                        {suggestion.title || `Point #${sugId}`}
                      </p>
                      {suggestion.suggestion_type && (
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                          {toTitleCase(suggestion.suggestion_type)}
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyle}`}>
                      {toTitleCase(suggestion.status || "pending")}
                    </span>
                  </div>

                  <p className="mt-1.5 text-sm text-slate-600">
                    {suggestion.description ||
                      (suggestion.latitude != null && suggestion.longitude != null
                        ? coordsToLocationString(
                            Number(suggestion.latitude).toFixed(4),
                            Number(suggestion.longitude).toFixed(4),
                          )
                        : "—")}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Submitted {formatDate(suggestion.created_at)}
                  </p>
                  {suggestion.admin_reply && (
                    <div className="mt-3 rounded-lg bg-emerald-50/70 px-3.5 py-2.5 text-sm text-emerald-800">
                      <span className="font-medium">Admin reply: </span>
                      {suggestion.admin_reply}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}