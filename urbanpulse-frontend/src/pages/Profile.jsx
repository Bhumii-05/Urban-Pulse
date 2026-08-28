import React, { useState, useEffect, useCallback } from "react";
import {
  Menu,
  X,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Pencil,
  Save,
  CheckCircle,
  AlertCircle,
  Bell,
  Calendar,
  LayoutDashboard,
  Recycle,
  ClipboardList,
  MapPin,
  Loader2,
  Camera,
  ArrowRight,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { profileService } from "../api/profile.service";

/* ------------------------------------------------------------------ */
/*  Theme tokens                                                       */
/* ------------------------------------------------------------------ */

const COLORS = {
  forestDeep: "#0B3D2E",
  forestDark: "#081C15",
  emerald: "#145A32",
  ember: "#F97316",
  mist: "#F4F7F5",
  ink: "#12241D",
  slate: "#5B6B65",
  line: "#E4EBE7",
  mintSoft: "#DCEFE3",
};

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Report Waste", icon: Recycle },
  
  { label: "Notifications", icon: Bell },
  { label: "Profile", icon: User },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function formatMemberSince(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function roleLabel(role) {
  if (!role) return "Citizen";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function getPasswordChecks(password) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

/* ------------------------------------------------------------------ */
/*  Small presentational pieces                                        */
/* ------------------------------------------------------------------ */

function EcoSkyline() {
  return (
    <div className="px-4 py-2 opacity-90" aria-hidden="true">
      <svg viewBox="0 0 288 110" className="w-full h-auto">
        <line x1="0" y1="100" x2="288" y2="100" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

        <rect x="18" y="55" width="34" height="45" rx="3" fill="rgba(255,255,255,0.06)" />
        <rect x="58" y="40" width="26" height="60" rx="3" fill="rgba(255,255,255,0.08)" />
        <rect x="90" y="65" width="30" height="35" rx="3" fill="rgba(255,255,255,0.05)" />

        <rect x="25" y="63" width="4" height="4" fill="rgba(255,255,255,0.25)" />
        <rect x="35" y="63" width="4" height="4" fill="rgba(255,255,255,0.25)" />
        <rect x="25" y="75" width="4" height="4" fill="rgba(255,255,255,0.25)" />
        <rect x="66" y="50" width="4" height="4" fill="rgba(255,255,255,0.25)" />
        <rect x="66" y="62" width="4" height="4" fill="rgba(255,255,255,0.25)" />
        <rect x="66" y="74" width="4" height="4" fill="rgba(255,255,255,0.25)" />

        <g>
          <line x1="148" y1="88" x2="148" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <circle cx="148" cy="80" r="12" fill="rgba(124,217,166,0.18)" />
        </g>
        <g>
          <line x1="171" y1="92" x2="171" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <circle cx="171" cy="86" r="8" fill="rgba(124,217,166,0.15)" />
        </g>

        <line x1="232" y1="35" x2="232" y2="100" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
        <g className="eco-blades">
          <line x1="232" y1="35" x2="232" y2="14" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="232" y1="35" x2="250" y2="45" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="232" y1="35" x2="214" y2="45" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="232" cy="35" r="3" fill="rgba(255,255,255,0.5)" />
        </g>
      </svg>
    </div>
  );
}

function Sidebar({ isOpen, onClose, onNavigate, userName, userEmail, onLogout }) {
  const initials = getInitials(userName);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{ background: `linear-gradient(160deg, ${COLORS.forestDeep} 0%, ${COLORS.forestDark} 100%)` }}
    >
      <div className="flex items-center justify-between px-6 pt-6 pb-5 flex-shrink-0">
        <div>
          <div className="text-lg font-extrabold tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
            <span className="text-white">URBAN </span>
            <span style={{ color: "#7CD9A6" }}>PULSE</span>
          </div>
          <div className="text-xs mt-0.5" style={{ color: "#9BBFAE" }}>
            Smart Waste Management System
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="sidebar-icon-btn w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      <nav className="flex-1 px-4 mt-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ label, icon: Icon }) => {
          const active = label === "Profile";
          return (
            <button
              key={label}
              onClick={() => onNavigate(label)}
              className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={active ? { backgroundColor: COLORS.emerald, color: "#FFFFFF" } : { color: "#B7D2C3" }}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      <EcoSkyline />

      <div className="px-4 py-4 border-t flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="mini-profile w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-colors"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${COLORS.emerald}, ${COLORS.ember})` }}
            >
              {initials}
            </div>
            <div className="text-left overflow-hidden flex-1">
              <div className="text-sm font-semibold text-white truncate">{userName}</div>
              <div className="text-xs truncate" style={{ color: "#9BBFAE" }}>
                {userEmail}
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                profileMenuOpen ? "rotate-180" : ""
              }`}
              style={{ color: "#9BBFAE" }}
            />
          </button>

          {profileMenuOpen && (
            <div
              className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border shadow-xl"
              style={{
                backgroundColor: "#123C2D",
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors hover:bg-white/10"
                style={{ color: "#FFFFFF" }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <div className="flex items-start justify-between mb-8 gap-4">
      <div>
        <h1
          className="text-3xl font-extrabold tracking-tight"
          style={{ color: COLORS.ink, fontFamily: "Manrope, sans-serif" }}
        >
          Profile
        </h1>
        <p className="mt-1 text-sm" style={{ color: COLORS.slate }}>
          Manage your account information and security.
        </p>
      </div>
      <button
        aria-label="Notifications"
        className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white border shadow-sm hover:shadow-md transition-shadow flex-shrink-0"
        style={{ borderColor: COLORS.line }}
      >
        <Bell className="w-5 h-5" style={{ color: COLORS.ink }} />
        <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.ember }} />
      </button>
    </div>
  );
}

function FieldRow({ icon: Icon, label, value, editable, inputValue, onChange }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 py-3.5">
      <div className="flex items-center gap-2 sm:w-40 flex-shrink-0 text-sm font-medium" style={{ color: COLORS.slate }}>
        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: COLORS.emerald }} />
        {label}
      </div>
      {editable ? (
        <input
          value={inputValue}
          onChange={(e) => onChange(e.target.value)}
          className="field-input flex-1 text-sm font-medium px-3 py-2 rounded-lg border outline-none transition-colors"
          style={{ color: COLORS.ink, borderColor: COLORS.line }}
          aria-label={label}
        />
      ) : (
        <div className="flex-1 text-sm font-medium" style={{ color: COLORS.ink }}>
          {value || "—"}
        </div>
      )}
    </div>
  );
}

function ProfileInfoCard({ profile, editMode, draft, saving, onEdit, onCancel, onChange, onSave, onPhotoClick }) {
  const initials = getInitials(profile.full_name);
  return (
    <section className="bg-white rounded-3xl border shadow-sm p-6 md:p-8 mb-6" style={{ borderColor: COLORS.line }}>
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <User className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.emerald }} />
          <h2 className="text-lg font-bold truncate" style={{ color: COLORS.ink, fontFamily: "Manrope, sans-serif" }}>
            Profile Information
          </h2>
        </div>
        {!editMode ? (
          <button
            onClick={onEdit}
            className="btn-outline-emerald flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border transition-colors flex-shrink-0"
            style={{ color: COLORS.emerald, borderColor: COLORS.emerald }}
          >
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onCancel}
              disabled={saving}
              className="text-sm font-semibold px-4 py-2 rounded-full border transition-colors disabled:opacity-50"
              style={{ color: COLORS.slate, borderColor: COLORS.line }}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full text-white transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ backgroundColor: COLORS.emerald }}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-3 md:w-52 flex-shrink-0">
          <div className="relative flex-shrink-0">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${COLORS.emerald}, ${COLORS.forestDeep})`,
                fontFamily: "Manrope, sans-serif",
              }}
            >
              {initials}
            </div>
            <button
              onClick={onPhotoClick}
              aria-label="Change profile photo"
              className="photo-btn absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border"
              style={{ borderColor: COLORS.line }}
            >
              <Camera className="w-4 h-4" style={{ color: COLORS.ink }} />
            </button>
          </div>
          <div className="min-w-0">
            <div className="font-bold text-lg truncate" style={{ color: COLORS.ink, fontFamily: "Manrope, sans-serif" }}>
              {profile.full_name}
            </div>
            <span
              className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: COLORS.mintSoft, color: COLORS.emerald }}
            >
              {roleLabel(profile.role)}
            </span>
            <div
              className="flex items-center gap-1.5 mt-2 text-xs font-medium"
              style={{ color: profile.is_active ? COLORS.emerald : "#B45309" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: profile.is_active ? "#22C55E" : "#F59E0B" }}
              />
              {profile.is_active ? "Active account" : "Inactive account"}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs" style={{ color: COLORS.slate }}>
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              Member since {formatMemberSince(profile.created_at)}
            </div>
          </div>
        </div>

        <div className="flex-1 divide-y min-w-0" style={{ borderColor: COLORS.line }}>
          <FieldRow
            icon={User}
            label="Full Name"
            value={profile.full_name}
            editable={editMode}
            inputValue={draft.full_name}
            onChange={(v) => onChange("full_name", v)}
          />
          <FieldRow icon={Mail} label="Email Address" value={profile.email} editable={false} />
          <FieldRow
            icon={Phone}
            label="Phone Number"
            value={profile.phone_number}
            editable={editMode}
            inputValue={draft.phone_number}
            onChange={(v) => onChange("phone_number", v)}
          />
          <FieldRow icon={ShieldCheck} label="Role" value={roleLabel(profile.role)} editable={false} />
        </div>
      </div>
    </section>
  );
}

function PasswordField({ label, placeholder, value, show, onToggle, onChange }) {
  return (
    <div className="min-w-0">
      <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.slate }}>
        {label}
      </label>
      <div className="relative flex items-center">
        <Lock className="w-4 h-4 absolute left-3 pointer-events-none flex-shrink-0" style={{ color: COLORS.slate }} />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="field-input w-full text-sm pl-9 pr-10 py-2.5 rounded-lg border outline-none transition-colors"
          style={{ borderColor: COLORS.line, color: COLORS.ink }}
          aria-label={label}
        />
        <button
          type="button"
          onClick={onToggle}
          className="eye-btn absolute right-3 flex-shrink-0"
          style={{ color: COLORS.slate }}
          aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function Requirement({ met, label }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium transition-colors" style={{ color: met ? COLORS.emerald : COLORS.slate }}>
      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: met ? COLORS.emerald : "#C7D2CC" }} />
      {label}
    </div>
  );
}

function ChangePasswordCard({ values, show, onToggleShow, onChange, onSubmit, submitting }) {
  const checks = getPasswordChecks(values.newPassword);
  const allMet = Object.values(checks).every(Boolean);
  const matches = values.confirmPassword.length > 0 && values.newPassword === values.confirmPassword;
  const canSubmit = values.currentPassword.length > 0 && allMet && matches;

  return (
    <section className="bg-white rounded-3xl border shadow-sm p-6 md:p-8 mb-6" style={{ borderColor: COLORS.line }}>
      <div className="flex items-start gap-2 mb-6">
        <Lock className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: COLORS.emerald }} />
        <div>
          <h2 className="text-lg font-bold" style={{ color: COLORS.ink, fontFamily: "Manrope, sans-serif" }}>
            Change Password
          </h2>
          <p className="text-sm mt-0.5" style={{ color: COLORS.slate }}>
            Update your password to keep your account secure.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PasswordField
          label="Current Password"
          placeholder="Enter current password"
          value={values.currentPassword}
          show={show.currentPassword}
          onToggle={() => onToggleShow("currentPassword")}
          onChange={(v) => onChange("currentPassword", v)}
        />
        <PasswordField
          label="New Password"
          placeholder="Enter new password"
          value={values.newPassword}
          show={show.newPassword}
          onToggle={() => onToggleShow("newPassword")}
          onChange={(v) => onChange("newPassword", v)}
        />
        <PasswordField
          label="Confirm New Password"
          placeholder="Confirm new password"
          value={values.confirmPassword}
          show={show.confirmPassword}
          onToggle={() => onToggleShow("confirmPassword")}
          onChange={(v) => onChange("confirmPassword", v)}
        />
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="text-sm font-semibold mb-2" style={{ color: COLORS.ink }}>
            Password must contain:
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            <Requirement met={checks.length} label="At least 8 characters" />
            <Requirement met={checks.uppercase} label="One uppercase letter" />
            <Requirement met={checks.number} label="One number" />
            <Requirement met={checks.special} label="One special character" />
          </div>
          {values.confirmPassword.length > 0 && (
            <div
              className="flex items-center gap-1.5 mt-2.5 text-xs font-medium"
              style={{ color: matches ? COLORS.emerald : "#DC2626" }}
            >
              {matches ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {matches ? "Passwords match" : "Passwords do not match"}
            </div>
          )}
        </div>
        <button
          onClick={() => onSubmit(canSubmit)}
          disabled={!canSubmit || submitting}
          className="flex items-center justify-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          style={{ backgroundColor: COLORS.emerald }}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Updating…
            </>
          ) : (
            "Update Password"
          )}
        </button>
      </div>
    </section>
  );
}

function SecurityCard({ onContactSupport }) {
  return (
    <section
      className="rounded-3xl p-6 md:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
      style={{ backgroundColor: COLORS.mintSoft, border: `1px solid ${COLORS.line}` }}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: COLORS.emerald }}
        >
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="font-bold" style={{ color: COLORS.ink, fontFamily: "Manrope, sans-serif" }}>
            Your Account is Secure
          </div>
          <p className="text-sm mt-0.5" style={{ color: COLORS.slate }}>
            Your account information is protected and your password is securely encrypted.
          </p>
        </div>
      </div>
      <div className="flex-shrink-0 sm:text-right">
        <div className="text-xs font-medium mb-1" style={{ color: COLORS.slate }}>
          Need help?
        </div>
        <button
          onClick={onContactSupport}
          className="support-link inline-flex items-center gap-1 text-sm font-semibold transition-all"
          style={{ color: COLORS.emerald }}
        >
          Contact Support <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

function ProfileSkeleton() {
  return (
    <div>
      <div className="bg-white rounded-3xl border p-6 md:p-8 mb-6" style={{ borderColor: COLORS.line }}>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-24 h-24 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: COLORS.line }} />
          <div className="flex-1 w-full space-y-4">
            {[78, 60, 68, 50].map((w, i) => (
              <div key={i} className="h-4 rounded animate-pulse" style={{ backgroundColor: COLORS.line, width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-3xl border p-6 md:p-8" style={{ borderColor: COLORS.line }}>
        <div className="h-4 w-40 rounded animate-pulse mb-6" style={{ backgroundColor: COLORS.line }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-11 rounded-lg animate-pulse" style={{ backgroundColor: COLORS.line }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorCard({ message, onRetry }) {
  return (
    <div className="bg-white rounded-3xl border p-10 flex flex-col items-center text-center gap-3" style={{ borderColor: COLORS.line }}>
      <AlertCircle className="w-8 h-8" style={{ color: "#DC2626" }} />
      <div className="font-semibold" style={{ color: COLORS.ink }}>
        Couldn't load your profile
      </div>
      <p className="text-sm max-w-sm" style={{ color: COLORS.slate }}>
        {message}
      </p>
      <button
        onClick={onRetry}
        className="mt-2 text-sm font-semibold px-5 py-2 rounded-full text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: COLORS.emerald }}
      >
        Try Again
      </button>
    </div>
  );
}

function Toast({ type, message }) {
  const isSuccess = type === "success";
  return (
    <div
      className="toast-anim flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-xl shadow-lg bg-white border"
      style={{ borderColor: COLORS.line, minWidth: "260px" }}
    >
      {isSuccess ? (
        <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.emerald }} />
      ) : (
        <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#DC2626" }} />
      )}
      <span className="text-sm font-medium" style={{ color: COLORS.ink }}>
        {message}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState({ full_name: "", phone_number: "" });
  const [saving, setSaving] = useState(false);

  const [pwValues, setPwValues] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwShow, setPwShow] = useState({ currentPassword: false, newPassword: false, confirmPassword: false });
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (e) {
      setError(e.response?.data?.detail || e.message || "We couldn't load your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleEditClick = () => {
    setDraft({ 
      full_name: profile?.full_name || "", 
      phone_number: profile?.phone_number || "" 
    });
    setEditMode(true);
  };

  const handleCancel = () => setEditMode(false);

  const handleFieldChange = (field, value) => {
    setDraft((d) => ({ ...d, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await profileService.updateProfile({
        full_name: draft.full_name,
        phone_number: draft.phone_number,
      });
      setProfile(updated);
      setEditMode(false);
      pushToast("success", "Profile updated successfully.");
    } catch (e) {
      pushToast("error", e.response?.data?.detail || e.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePwChange = (field, value) => setPwValues((v) => ({ ...v, [field]: value }));
  const handlePwToggle = (field) => setPwShow((s) => ({ ...s, [field]: !s[field] }));

  const handlePwSubmit = async (canSubmit) => {
    if (!canSubmit || pwSubmitting) return;
    setPwSubmitting(true);
    try {
      await profileService.changePassword({
        current_password: pwValues.currentPassword,
        new_password: pwValues.newPassword,
      });
      setPwValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
      pushToast("success", "Password updated successfully.");
    } catch (e) {
      pushToast("error", e.response?.data?.detail || e.message || "Could not update password.");
    } finally {
      setPwSubmitting(false);
    }
  };

  const handlePhotoClick = () => pushToast("success", "Photo upload is coming soon.");
  const handleContactSupport = () => pushToast("success", "Support request noted — we'll be in touch.");
  const handleNavigate = () => setSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.location.href = "/login";
  };

  return (
    <div
  className="min-h-screen relative"
  style={{
    background:
      "linear-gradient(135deg, #EAF4EE 0%, #F4F7F5 45%, #DCEFE3 100%)",
  }}
>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        .up-profile-root, .up-profile-root * {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .toast-anim { animation: toastIn 0.25s ease-out; }

        @keyframes ecoSpin { to { transform: rotate(360deg); } }
        .eco-blades { transform-box: fill-box; transform-origin: center; animation: ecoSpin 7s linear infinite; }

        @media (prefers-reduced-motion: reduce) {
          .eco-blades { animation: none; }
          .toast-anim { animation: none; }
        }

        .nav-item:hover { background-color: rgba(255,255,255,0.08); }
        .sidebar-icon-btn:hover { background-color: rgba(255,255,255,0.1); }
        .mini-profile:hover { background-color: rgba(255,255,255,0.05); }
        .btn-outline-emerald:hover { background-color: ${COLORS.mintSoft}; }
        .photo-btn:hover { transform: scale(1.06); }
        .photo-btn { transition: transform 0.15s ease; }
        .eye-btn:hover { color: ${COLORS.ink} !important; }
        .support-link:hover { gap: 0.5rem; }

        .field-input:focus {
          border-color: ${COLORS.emerald} !important;
          box-shadow: 0 0 0 3px rgba(20,90,50,0.12);
        }

        button:focus-visible, a:focus-visible {
          outline: 2px solid ${COLORS.emerald};
          outline-offset: 2px;
        }
      `}</style>

      <div className="up-profile-root">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 md:hidden transition-opacity"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            aria-hidden="true"
          />
        )}

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          userName={profile ? profile.full_name : "Loading…"}
          userEmail={profile ? profile.email : ""}
        />

        <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? "md:ml-72" : "md:ml-0"}`}>
          {/* Utility bar: hamburger menu toggle */}
          <div
  className="sticky top-0 z-20 backdrop-blur-md"
  style={{
    backgroundColor: "rgba(234, 244, 238, 0.85)",
    borderBottom: "1px solid rgba(20, 90, 50, 0.08)",
  }}
>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
                className={`flex items-center justify-center w-10 h-10 rounded-full shadow-md transition-all duration-200 ${
                  sidebarOpen ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"
                }`}
                style={{ backgroundColor: COLORS.forestDeep }}
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <TopBar />

            {loading ? (
              <ProfileSkeleton />
            ) : error ? (
              <ErrorCard message={error} onRetry={loadProfile} />
            ) : (
              <>
                <ProfileInfoCard
                  profile={profile}
                  editMode={editMode}
                  draft={draft}
                  saving={saving}
                  onEdit={handleEditClick}
                  onCancel={handleCancel}
                  onChange={handleFieldChange}
                  onSave={handleSave}
                  onPhotoClick={handlePhotoClick}
                />
                <ChangePasswordCard
                  values={pwValues}
                  show={pwShow}
                  onToggleShow={handlePwToggle}
                  onChange={handlePwChange}
                  onSubmit={handlePwSubmit}
                  submitting={pwSubmitting}
                />
                <SecurityCard onContactSupport={handleContactSupport} />
              </>
            )}
          </main>
        </div>

        {/* Toasts */}
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3" role="status" aria-live="polite">
          {toasts.map((t) => (
            <Toast key={t.id} type={t.type} message={t.message} />
          ))}
        </div>
      </div>
    </div>
  );
}