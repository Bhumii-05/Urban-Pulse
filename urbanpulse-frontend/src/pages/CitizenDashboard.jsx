import React, { useState, useRef } from "react";
import {
  Leaf,
  Bell,
  ChevronDown,
  X,
  Eye,
  Trash2,
  AlertTriangle,
  LogOut,
  Settings,
  CheckCircle2,
  User as UserIcon,
  Layers3,
  Truck,
  CircleCheck,
  TriangleAlert,
  Hammer,
  ClipboardList,
  MapPin,
} from "lucide-react";
import FloatingChatbot from "../components/FloatingChatbot";
/* ------------------------------------------------------------------ */
/*  Background image — same asset as the Admin Dashboard              */
/* ------------------------------------------------------------------ */
const BACKGROUND_IMAGE_URL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wAARCAONBkADASIAAhEBAxEB/8QAGwABAQADAQEBAAAAAAAAAAAAAAECAwQFBgf/xABCEAEAAgIBAgQEAwYDCAICAAcAAQIDEQQSIQUxQVETImFxMoGRBhQjQlJyM6GxFSRDYoKSwdE0RFNUc+EWJWOi8P/EABoBAQEBAQEBAQAAAAAAAAAAAAABAgMEBQb/xAAvEQEBAAIBAwQCAgEEAQUBAAAAAQIRAxIhMQQTQVEUMiJhBSNScYFCkpMH/xAAAEAEBAQEBAAAAAAAAAAAAAAABAhEAMf/aAAwDAQACEAMBB4A3YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/Z";


/* ------------------------------------------------------------------ */
/*  Dummy data — all sample values live here                          */
/* ------------------------------------------------------------------ */
const dummyCitizen = { name: "Aditi Sharma", role: "Citizen" };

const dummyStats = {
  totalReports: 12,
  assignedReports: 3,
  resolvedReports: 9,
};

const dummyConcerns = [
  {
    id: 1,
    category: "Overflowing Bin",
    status: "Assigned",
    reportedDate: "2026-08-22",
    description: "The garbage bin near the main road is overflowing and needs urgent collection.",
    location: "Sector 4, Near Community Park",
    assignedTo: "Collection Worker - Ramesh K.",
    resolvedAt: null,
    resolutionNote: "",
  },
  {
    id: 2,
    category: "Missed Pickup",
    status: "Assigned",
    reportedDate: "2026-08-19",
    description: "Scheduled waste pickup was missed for the third consecutive day on this street.",
    location: "Green Avenue, Block C",
    assignedTo: "Collection Worker - Suresh P.",
    resolvedAt: null,
    resolutionNote: "",
  },
  {
    id: 3,
    category: "Illegal Dumping",
    status: "Resolved",
    reportedDate: "2026-08-15",
    description: "Construction debris was illegally dumped behind the community center.",
    location: "Behind Community Center, Sector 7",
    assignedTo: "Collection Worker - Anita D.",
    resolvedAt: "2026-08-17",
    resolutionNote: "Debris cleared and area sanitized.",
  },
  {
    id: 4,
    category: "Damaged Bin",
    status: "Pending",
    reportedDate: "2026-08-10",
    description: "The public waste bin lid is broken and attracting stray animals.",
    location: "Market Street, Near Bus Stop",
    assignedTo: null,
    resolvedAt: null,
    resolutionNote: "",
  },
];



/* ------------------------------------------------------------------ */
/*  Category → icon + status → style maps                             */
/* ------------------------------------------------------------------ */
const CATEGORY_ICONS = {
  "Overflowing Bin": Trash2,
  "Missed Pickup": Truck,
  "Illegal Dumping": TriangleAlert,
  "Damaged Bin": Hammer,
};
function CategoryIcon({ category }) {
  const Icon = CATEGORY_ICONS[category] || ClipboardList;
  return (
    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-emerald-700" />
    </div>
  );
}

const STATUS_BADGE_STYLES = {
  Assigned: "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200",
  Resolved: "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  Pending: "bg-red-100 text-red-700 ring-1 ring-inset ring-red-200",
};
const STATUS_DOT = {
  Assigned: "bg-amber-500",
  Resolved: "bg-emerald-500",
  Pending: "bg-red-500",
};
function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        STATUS_BADGE_STYLES[status] || "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] || "bg-gray-400"}`} />
      {status}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}
function formatDateLong(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

/* ------------------------------------------------------------------ */
/*  Toast                                                              */
/* ------------------------------------------------------------------ */
function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-[fadeInUp_0.25s_ease-out]">
      <div className="flex items-center gap-2 bg-[#0B3D2E] text-white text-sm font-medium px-4 py-3 rounded-xl shadow-2xl ring-1 ring-white/10">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        {message}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared bits                                                        */
/* ------------------------------------------------------------------ */
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Modal({ open, onClose, children, narrow }) {
  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-200 p-4 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${narrow ? "max-w-sm" : "max-w-md"} p-6 transition-transform duration-200 max-h-[90vh] overflow-y-auto ${
          open ? "scale-100" : "scale-95"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function CitizenDashboard() {
  const [concerns, setConcerns] = useState(dummyConcerns);

  const [viewConcern, setViewConcern] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestForm, setSuggestForm] = useState({ location: "", reason: "", description: "" });

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState("");

  const toastTimer = useRef(null);
  function fireToast(message) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  }

  /* ---------------------------- View ---------------------------- */
  function openView(concern) {
    setViewConcern(concern);
  }
  function closeView() {
    setViewConcern(null);
  }

  /* --------------------------- Delete ------------------------------ */
  function openDelete(concern) {
    setDeleteTarget(concern);
  }
  function closeDelete() {
    setDeleteTarget(null);
  }
  function confirmDelete() {
    setConcerns((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    fireToast("Concern deleted");
    if (viewConcern && viewConcern.id === deleteTarget.id) setViewConcern(null);
    closeDelete();
  }

  /* ------------------------ Suggest point --------------------------- */
  function openSuggest() {
    setSuggestForm({ location: "", reason: "", description: "" });
    setShowSuggest(true);
  }
  function closeSuggest() {
    setShowSuggest(false);
  }
  function submitSuggestion() {
    if (!suggestForm.location.trim()) {
      fireToast("Please add a location for your suggestion");
      return;
    }
    fireToast("Your suggestion was submitted");
    closeSuggest();
  }

  return (
    <div className="min-h-screen w-full relative font-sans text-[#123B2E]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .font-sans { font-family: 'Manrope', ui-sans-serif, system-ui, sans-serif; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        .animate-scaleIn { animation: scaleIn 0.18s ease-out; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat bg-[#eaf4ee]"
        style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }}
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-white/10 via-white/30 to-white/60" />

      {/* ============================== Navbar ============================== */}
      <header className="sticky top-0 z-40 bg-[#0B3D2E]/95 backdrop-blur-md shadow-lg">
        <div className="w-full px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#0DBF78] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="leading-none">
              <p className="font-bold text-[19px] tracking-[-0.02em]">
                <span className="text-white">Urban</span>
                <span className="text-[#0DBF78]">Pulse</span>
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#A7D8CB]">Smart Waste Management</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-emerald-100/90">
            <button className="hover:text-white transition-colors">About Us</button>
            <button className="hover:text-white transition-colors">Features</button>
            <button className="hover:text-white transition-colors">Contact Us</button>
            <button className="hover:text-white transition-colors">Raise A Concern</button>
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen((o) => !o);
                  setProfileOpen(false);
                }}
                className="relative w-9 h-9 rounded-full flex items-center justify-center text-emerald-100 hover:bg-white/10 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0B3D2E]" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl ring-1 ring-black/5 overflow-hidden animate-scaleIn origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-100 font-semibold text-sm text-gray-700">Notifications</div>
                  <div className="px-4 py-3 text-xs text-gray-400">You're all caught up 🍃</div>
                </div>
              )}
            </div>

            <div className="w-px h-8 bg-white/15" />

            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen((o) => !o);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2.5 hover:bg-white/10 rounded-full pl-1 pr-2 py-1 transition-colors"
                aria-haspopup="true"
                aria-expanded={profileOpen}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white/20">
                  {dummyCitizen.name[0].toUpperCase()}
                </div>
                <div className="text-left leading-tight hidden sm:block">
                  <p className="text-white text-sm font-semibold">{dummyCitizen.name}</p>
                  <p className="text-emerald-200/70 text-[11px]">{dummyCitizen.role}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-emerald-200/70 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl ring-1 ring-black/5 overflow-hidden animate-scaleIn origin-top-right">
                  <button onClick={() => setProfileOpen(false)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 transition-colors">
                    <UserIcon className="w-4 h-4" /> Profile
                  </button>
                  <button onClick={() => setProfileOpen(false)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 transition-colors">
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      fireToast("Logged out");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50"
                  >
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ============================== Main ============================== */}
      <main className="max-w-6xl mx-auto px-6 pt-8 pb-12">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B3D2E]">Citizen Dashboard</h1>

          <div className="flex items-center gap-1.5 bg-white rounded-xl p-1 border border-gray-200 w-fit shadow-sm">
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#0B3D2E] text-white shadow-sm">
              <ClipboardList className="w-3.5 h-3.5" /> Dashboard View
            </button>
            <button
              onClick={openSuggest}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" /> Suggest Point
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="group bg-white/90 backdrop-blur-xl rounded-2xl border border-emerald-100 shadow-lg shadow-emerald-900/10 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Reported Concerns</p>
                <p className="text-3xl font-bold text-[#0B3D2E] mt-2">{dummyStats.totalReports}</p>
                <p className="text-xs text-gray-400 mt-1">My total reports</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 transition-colors shrink-0">
                <Layers3 className="w-5 h-5 text-emerald-700 group-hover:text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl rounded-2xl border border-amber-100 shadow-lg shadow-amber-900/10 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">In Progress (Assigned)</p>
                <p className="text-3xl font-bold text-[#0B3D2E] mt-2">{dummyStats.assignedReports}</p>
                <p className="text-xs text-gray-400 mt-1">Being addressed</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-500 transition-colors shrink-0">
                <Truck className="w-5 h-5 text-amber-600 group-hover:text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl rounded-2xl border border-green-100 shadow-lg shadow-green-900/10 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Resolved Concerns</p>
                <p className="text-3xl font-bold text-[#0B3D2E] mt-2">{dummyStats.resolvedReports}</p>
                <p className="text-xs text-gray-400 mt-1">Successfully fixed</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-600 transition-colors shrink-0">
                <CircleCheck className="w-5 h-5 text-green-700 group-hover:text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Suggest CTA */}
        <div className="flex justify-center mb-8">
          <button
            onClick={openSuggest}
            className="flex items-center gap-2 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-md shadow-emerald-900/10 transition-all"
          >
            <MapPin className="w-4 h-4" /> Suggest New Waste Pick Point
          </button>
        </div>

        {/* My Concerns List */}
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl ring-1 ring-white/60 border border-white/40 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0B3D2E]">My Concerns List</h2>
              <p className="text-sm text-gray-500">Everything you've reported, and where it stands.</p>
            </div>
          </div>

          {concerns.length === 0 && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 px-5 py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <ClipboardList className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-[#0B3D2E] mb-1">No concerns reported yet.</p>
              <p className="text-xs text-gray-500 mb-4">Report a waste-related issue and help keep your city clean.</p>
              <button className="inline-flex items-center gap-1.5 bg-[#0B3D2E] text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-[#0f4d3a] transition-colors">
                Raise A Concern
              </button>
            </div>
          )}

          {concerns.length > 0 && (
            <>
              {/* Desktop / tablet table */}
              <div className="hidden sm:block rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wide">
                        <th className="text-left font-semibold px-5 py-3">Category</th>
                        <th className="text-left font-semibold px-5 py-3">Reported Date</th>
                        <th className="text-left font-semibold px-5 py-3">Status</th>
                        <th className="text-left font-semibold px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {concerns.map((c) => (
                        <tr key={c.id} className="border-t border-gray-100 hover:bg-emerald-50/40 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <CategoryIcon category={c.category} />
                              <span className="font-medium text-[#123B2E]">{c.category}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-gray-600">{formatDate(c.reportedDate)}</td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openView(c)}
                                className="flex items-center gap-1 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" /> View details
                              </button>
                              {c.status === "Pending" && (
                                <button
                                  onClick={() => openDelete(c)}
                                  className="text-red-500 border border-red-200 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  aria-label={`Delete ${c.category} concern`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile stacked cards */}
              <div className="sm:hidden space-y-3">
                {concerns.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <CategoryIcon category={c.category} />
                        <span className="font-medium text-[#123B2E] text-sm">{c.category}</span>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Reported {formatDate(c.reportedDate)}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openView(c)}
                        className="flex-1 flex items-center justify-center gap-1 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View details
                      </button>
                      {c.status === "Pending" && (
                        <button
                          onClick={() => openDelete(c)}
                          className="text-red-500 border border-red-200 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          aria-label={`Delete ${c.category} concern`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* View Details modal */}
      <Modal open={Boolean(viewConcern)} onClose={closeView}>
        {viewConcern && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#0B3D2E]">Concern Details</h2>
              <button onClick={closeView} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <Field label="Category">
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gray-50 text-sm text-gray-700">
                  <CategoryIcon category={viewConcern.category} />
                  {viewConcern.category}
                </div>
              </Field>
              <Field label="Status">
                <div className="px-3.5 py-2.5 rounded-xl bg-gray-50">
                  <StatusBadge status={viewConcern.status} />
                </div>
              </Field>
              <Field label="Reported">
                <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 text-sm text-gray-700">{formatDateLong(viewConcern.reportedDate)}</div>
              </Field>
              {viewConcern.location && (
                <Field label="Location">
                  <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 text-sm text-gray-700">{viewConcern.location}</div>
                </Field>
              )}
              {viewConcern.description && (
                <Field label="Description">
                  <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 text-sm text-gray-700">{viewConcern.description}</div>
                </Field>
              )}
              {viewConcern.assignedTo && (
                <Field label="Assigned To">
                  <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 text-sm text-gray-700">{viewConcern.assignedTo}</div>
                </Field>
              )}
              {viewConcern.status === "Resolved" && (
                <Field label="Resolution">
                  <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50 text-sm text-emerald-800">
                    {viewConcern.resolutionNote || "Marked resolved"}
                    {viewConcern.resolvedAt ? ` · ${formatDateLong(viewConcern.resolvedAt)}` : ""}
                  </div>
                </Field>
              )}
            </div>
            <button
              onClick={closeView}
              className="w-full mt-7 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-sm font-semibold hover:from-emerald-600 hover:to-emerald-800 transition-all"
            >
              Close
            </button>
          </>
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={Boolean(deleteTarget)} onClose={closeDelete} narrow>
        {deleteTarget && (
          <div className="text-center py-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-red-600 mx-auto">Delete This Concern?</h2>
              <button onClick={closeDelete} className="text-gray-400 hover:text-gray-600 absolute right-6 top-6">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto my-4">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-sm text-gray-500 px-2 mb-7">
              Are you sure you want to delete your <span className="font-semibold text-gray-700">{deleteTarget.category}</span> report?
              This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">
                Delete
              </button>
              <button onClick={closeDelete} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Suggest New Waste Pick Point modal */}
      <Modal open={showSuggest} onClose={closeSuggest}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#0B3D2E]">Suggest a Waste Pick Point</h2>
          <button onClick={closeSuggest} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <Field label="Location">
            <input
              value={suggestForm.location}
              onChange={(e) => setSuggestForm({ ...suggestForm, location: e.target.value })}
              placeholder="e.g. Near Sector 4 park entrance"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400"
            />
          </Field>
          <Field label="Reason">
            <input
              value={suggestForm.reason}
              onChange={(e) => setSuggestForm({ ...suggestForm, reason: e.target.value })}
              placeholder="e.g. High foot traffic, no bin within 200m"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400"
            />
          </Field>
          <Field label="Description (optional)">
            <textarea
              value={suggestForm.description}
              onChange={(e) => setSuggestForm({ ...suggestForm, description: e.target.value })}
              placeholder="Any extra detail that helps evaluate the spot"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 resize-none"
            />
          </Field>
        </div>
        <button
          onClick={submitSuggestion}
          className="w-full mt-7 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-sm font-semibold hover:from-emerald-600 hover:to-emerald-800 transition-all"
        >
          Submit Suggestion
        </button>
      </Modal>
      
                  <Toast message={toast} />
      
            {/* Floating AI Chatbot */}
            <FloatingChatbot />
      
          </div>
        );
      }