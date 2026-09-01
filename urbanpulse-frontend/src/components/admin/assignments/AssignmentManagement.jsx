import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  User,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Inbox,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
import { assignmentService } from "../../../api/assignment.service";
import { concernService } from "../../../api/concern.service";
import { userService } from "../../../api/admin.service";

function ProofModal({ concernId, onClose }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImages() {
      try {
        const data = await concernService.getConcernImages(concernId);
        setImages(Array.isArray(data) ? data : data?.images || []);
      } catch (err) {
        setImages([]);
      } finally {
        setLoading(false);
      }
    }
    if (concernId) fetchImages();
  }, [concernId]);

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4 animate-scaleIn">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-[#0B3D2E] font-bold text-sm flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            Worker Resolution Proof
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-full p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="p-10 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-xs text-gray-500">Loading proof images...</span>
            </div>
          ) : images.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">
              No photos attached to this task yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img.image_url || img.url || img}
                  alt="Proof"
                  className="rounded-xl border border-gray-200 object-cover h-40 w-full"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function AssignmentManagement({ fireToast }) {
  const [assignments, setAssignments] = useState([]);
  const [workers, setWorkers] = useState({});
  const [concerns, setConcerns] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewProofConcernId, setViewProofConcernId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [assnData, userData, concernData] = await Promise.allSettled([
        assignmentService.getAssignments(),
        userService.getAllUsers(),
        concernService.getAllConcerns(),
      ]);

      const rawAssn =
        assnData.status === "fulfilled" && Array.isArray(assnData.value)
          ? assnData.value
          : assnData.value?.assignments || [];

      // Map users for fast ID lookup
      const userMap = {};
      if (userData.status === "fulfilled") {
        const users = Array.isArray(userData.value)
          ? userData.value
          : userData.value?.users || [];
        users.forEach((u) => {
          userMap[u.id] = u.full_name || u.name || u.email;
        });
      }
      setWorkers(userMap);

      // Map concerns for fast ID lookup
      const concernMap = {};
      if (concernData.status === "fulfilled") {
        const cList = Array.isArray(concernData.value)
          ? concernData.value
          : concernData.value?.concerns || [];
        cList.forEach((c) => {
          concernMap[c.id] = c;
        });
      }
      setConcerns(concernMap);

      setAssignments(rawAssn);
    } catch (err) {
      if (fireToast) fireToast("Failed to load worker assignments");
    } finally {
      setLoading(false);
    }
  }, [fireToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (assignmentId, nextStatus) => {
    try {
      await assignmentService.updateAssignmentStatus(assignmentId, nextStatus);
      setAssignments((prev) =>
        prev.map((a) => (a.id === assignmentId ? { ...a, status: nextStatus } : a))
      );
      if (fireToast) fireToast(`Assignment #${assignmentId} marked as ${nextStatus}`);
    } catch (err) {
      if (fireToast) fireToast("Failed to update status");
    }
  };

  return (
    <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl ring-1 ring-white/60 border border-white/40 p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0B3D2E]">
              Worker Concern Dispatches
            </h1>
            <p className="text-sm text-gray-500">
              Track task assignments, worker progress, and verified completion proofs.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-600 transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
          <p className="text-xs text-gray-400">Loading assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="p-12 flex flex-col items-center justify-center gap-2 text-center text-gray-400">
          <Inbox className="w-8 h-8 text-gray-300" />
          <p className="text-xs font-medium text-gray-500">
            No work orders dispatched yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 text-[11px] uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-semibold">Order ID</th>
                <th className="px-5 py-3 text-left font-semibold">Assigned Worker</th>
                <th className="px-5 py-3 text-left font-semibold">Target Concern</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assignments.map((item) => {
                const targetConcern =
                  concerns[item.concern_id] || concerns[item.point_id];
                const workerName = workers[item.worker_id] || `Worker #${item.worker_id}`;
                const status = String(item.status || "pending").toLowerCase();
                const isCompleted = status === "completed" || status === "resolved";

                return (
                  <tr key={item.id} className="hover:bg-emerald-50/30 transition">
                    <td className="px-5 py-4 font-bold text-gray-800">#{item.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 font-medium text-gray-800">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span>{workerName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      <p className="font-semibold text-gray-800">
                        {targetConcern?.title || `Point #${item.point_id}`}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono truncate max-w-xs">
                        {typeof targetConcern?.location === "object"
                          ? `${targetConcern.location.latitude}, ${targetConcern.location.longitude}`
                          : targetConcern?.location || "Assigned Coordinates"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-700"
                            : status === "accepted" || status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {item.status || "Assigned"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Proof Modal Button */}
                        <button
                          type="button"
                          onClick={() =>
                            setViewProofConcernId(item.concern_id || item.point_id)
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium transition"
                        >
                          <ImageIcon className="w-3 h-3 text-emerald-600" /> Proof
                        </button>

                        {!isCompleted && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(item.id, "completed")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                          >
                            Mark Done
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {viewProofConcernId && (
        <ProofModal
          concernId={viewProofConcernId}
          onClose={() => setViewProofConcernId(null)}
        />
      )}
    </div>
  );
}