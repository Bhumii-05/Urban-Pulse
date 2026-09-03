import React, { useState } from "react";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  Camera,
  Loader2,
  Inbox,
} from "lucide-react";
import CompleteConcernModal from "./CompleteConcernModal";

export default function WorkerAssignmentsView({
  assignments = [],
  loading = false,
  onUpdateStatus,
  onCompleteConcern,
}) {
  const [completingAssignment, setCompletingAssignment] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const handleStatusTransition = async (assignment, nextStatus) => {
    if (nextStatus === "completed" || nextStatus === "resolved") {
      setCompletingAssignment(assignment);
      return;
    }
    setActionLoadingId(assignment.id);
    try {
      await onUpdateStatus(assignment.id, nextStatus);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden p-6">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-emerald-700" />
          <h2 className="font-bold text-sm text-[#0B3D2E]">Assigned Citizen Concerns</h2>
        </div>
        <span className="text-xs font-semibold text-gray-400">
          {assignments.length} Tasks
        </span>
      </div>

      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-2 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-xs">Loading work orders...</span>
        </div>
      ) : assignments.length === 0 ? (
        <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
          <Inbox className="w-8 h-8 text-gray-300 mb-1" />
          <p className="text-xs font-medium text-gray-500">No active work orders assigned to you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((item) => {
            const rawStatus = String(item.status || "pending").toLowerCase();
            const isCompleted = rawStatus === "completed" || rawStatus === "resolved";
            const isInProgress = rawStatus === "in_progress" || rawStatus === "accepted";
            const isPendingOrAssigned =
              rawStatus === "pending" || rawStatus === "assigned" || rawStatus === "open";

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#0B3D2E]">
                      {item.title || `Concern Work Order #${item.id}`}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-700"
                          : isInProgress
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.status || "Assigned"}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {item.description || "Resolve reported issue and upload completion proof."}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-gray-50 p-2 rounded-xl mb-3 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{item.location || "Assigned Coordinates"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{item.date || "Today"}</span>
                  </div>

                  {!isCompleted && (
                    <div className="flex items-center gap-2">
                      {isPendingOrAssigned && (
                        <button
                          type="button"
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleStatusTransition(item, "in_progress")}
                          className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                        >
                          {actionLoadingId === item.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <ArrowRight className="w-3 h-3" />
                          )}
                          Start
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleStatusTransition(item, "completed")}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Resolve & Upload Proof
                      </button>
                    </div>
                  )}

                  {isCompleted && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CompleteConcernModal
        assignment={completingAssignment}
        onClose={() => setCompletingAssignment(null)}
        onCompleted={onCompleteConcern}
      />
    </div>
  );
}