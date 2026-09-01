import React from "react";
import { CheckCircle2 } from "lucide-react";
import { createPortal } from "react-dom";
export function Modal({ open, onClose, children, narrow = false }) {
  if (!open) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px] animate-scaleIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white rounded-3xl shadow-2xl border border-slate-100 w-full ${
          narrow ? "max-w-sm" : "max-w-[440px]"
        } p-6 sm:p-7 max-h-[92vh] overflow-y-auto`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
export function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Toast({ message }) {
  if (!message) return null;

  // Format message safely if FastAPI passed an array of error objects
  const displayMessage = Array.isArray(message)
    ? message.map((m) => m.msg || JSON.stringify(m)).join(', ')
    : typeof message === 'object'
    ? message.msg || message.detail || JSON.stringify(message)
    : String(message);

  return (
    <div className="fixed bottom-6 right-6 z-100 animate-[fadeInUp_0.25s_ease-out]">
      <div className="flex items-center gap-2 bg-[#0B3D2E] text-white text-sm font-medium px-4 py-3 rounded-xl shadow-2xl ring-1 ring-white/10">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{displayMessage}</span>
      </div>
    </div>
  );
}

const ROLE_AVATAR_STYLES = {
  Admin: "bg-gradient-to-br from-violet-500 to-purple-600",
  Worker: "bg-gradient-to-br from-blue-500 to-indigo-600",
  Citizen: "bg-gradient-to-br from-emerald-500 to-green-600",
};

const ROLE_BADGE_STYLES = {
  Admin: "bg-violet-100 text-violet-700 ring-1 ring-inset ring-violet-200",
  Worker: "bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200",
  Citizen: "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200",
};

export function Avatar({ name, role, size = "w-10 h-10 text-sm" }) {
  const initials = (name || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${size} ${ROLE_AVATAR_STYLES[role] || "bg-gray-400"} rounded-full flex items-center justify-center text-white font-semibold shrink-0 shadow-sm ring-2 ring-white`}
    >
      {initials}
    </div>
  );
}

export function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        ROLE_BADGE_STYLES[role] || "bg-gray-100 text-gray-700"
      }`}
    >
      {role}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const norm = String(priority || "").toLowerCase();
  let style = "bg-gray-100 text-gray-700 border-gray-200";
  if (norm === "high" || norm === "critical")
    style = "bg-red-50 text-red-600 border-red-200";
  else if (norm === "medium")
    style = "bg-amber-50 text-amber-600 border-amber-200";
  else if (norm === "low")
    style = "bg-emerald-50 text-emerald-600 border-emerald-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} capitalize`}
    >
      {priority || "Low"}
    </span>
  );
}

export function StatusPill({ status }) {
  const active = status === "Active" || status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-medium ${
        active ? "text-emerald-600" : "text-gray-400"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-gray-300"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}