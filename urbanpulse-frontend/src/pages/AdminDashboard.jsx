import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Leaf,
  Bell,
  ChevronDown,
  Search,
  Plus,
  Calendar,
  X,
  Eye,
  Pencil,
  UserX,
  UserCheck,
  Trash2,
  AlertTriangle,
  Phone,
  Mail,
  Shield,
  User as UserIcon,
  LogOut,
  Settings,
  CheckCircle2,
  Users,
  Map,
  MessageSquare,
} from "lucide-react";
import { userService } from "../api/admin.service";
import { authService } from "../api/auth.service";
import FloatingChatbot from "../components/FloatingChatbot";

/* ------------------------------------------------------------------ */
/*  Background image                                                   */
/* ------------------------------------------------------------------ */
const BACKGROUND_IMAGE_URL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wAARCAONBkADASIAAhEBAxEB/8QAGwABAQADAQEBAAAAAAAAAAAAAAECAwQFBgf/xABCEAEAAgIBAgQEAwYDCAICAAcAAQIDEQQSIQUxQVETImFxMoGRBhQjQlJyM6GxFSRDYoKSwdE0RFNUc+EWJWOi8P/EABoBAQEBAQEBAQAAAAAAAAAAAAABAgMEBQb/xAAvEQEBAAIBAwQCAgEEAQUBAAAAAQIRAxIhMQQTQVEUMiJhBSNScYFCkpMH/xAAAEAEBAQEBAAAAAAAAAAAAAAABAhEAMf/aAAwDAQACEAMBB4A3YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/Z";

/* ------------------------------------------------------------------ */
/*  Dummy data / Options                                               */
/* ------------------------------------------------------------------ */
const ROLES = ["Admin", "Worker"];
const ROLE_FILTERS = ["All", "Admin", "Worker", "Citizen"];
const STATUS_FILTERS = ["All", "Active", "Inactive"];

const DATE_RANGES = ["Today", "Last 7 days", "Last 30 days"];

const PAGE_SIZE = 4;

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */
function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
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

function Avatar({ name, role, size = "w-10 h-10 text-sm" }) {
  return (
    <div
      className={`${size} ${ROLE_AVATAR_STYLES[role] || "bg-gray-400"} rounded-full flex items-center justify-center text-white font-semibold shrink-0 shadow-sm ring-2 ring-white`}
    >
      {getInitials(name)}
    </div>
  );
}

function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_BADGE_STYLES[role] || "bg-gray-100 text-gray-700"}`}>
      {role}
    </span>
  );
}

function StatusPill({ status }) {
  const active = status === "Active";
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${active ? "text-emerald-600" : "text-gray-400"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-300"}`} />
      {status}
    </span>
  );
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
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function UrbanPulseDashboard() {
  const [users, setUsers] = useState([]);
  const [adminUser, setAdminUser] = useState({ name: "Admin", role: "Admin" });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "Worker", phone: "" });
  const [deactivateUser, setDeactivateUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", phone: "", password: "", role: "Worker" });

  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [dateRange, setDateRange] = useState(DATE_RANGES[0]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState("");

  const toastTimer = useRef(null);

  function fireToast(message) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  }

  // Fetch Users and Current Admin Profile on Mount
  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      const list = Array.isArray(data) ? data : data.users || [];
      const normalized = list.map((u) => ({
        id: u.id || u._id,
        name: u.full_name || u.name || "User",
        email: u.email,
        role: u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase() : "Citizen",
        status: u.is_active === false || u.status === "Inactive" ? "Inactive" : "Active",
        phone: u.phone_number || u.phone || "—",
      }));
      setUsers(normalized);
    } catch (err) {
      fireToast(err.response?.data?.detail || "Failed to load users from backend");
    }
  };

  useEffect(() => {
    const initDashboard = async () => {
      // 1. Fetch Current Logged-in Admin User Profile
      try {
        const currentUserData = await authService.getCurrentUser();
        if (currentUserData) {
          setAdminUser({
            name: currentUserData.full_name || currentUserData.name || "Admin",
            role: currentUserData.role
              ? currentUserData.role.charAt(0).toUpperCase() + currentUserData.role.slice(1).toLowerCase()
              : "Admin",
          });
        }
      } catch (err) {
        console.error("Failed to load current admin user profile:", err);
      }

      // 2. Fetch All Users List
      await fetchUsers();
    };

    initDashboard();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      const matchesStatus = statusFilter === "All" || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pagedUsers = filteredUsers.slice(pageStart, pageStart + PAGE_SIZE);
    // Analytics
  const totalUsers = users.length;

  const totalWorkers = users.filter(
    (user) => user.role === "Worker"
  ).length;

  // These will be connected to the Concerns / Collections API later
  const pendingConcerns = 0;
  const resolvedConcerns = 0;
  const todayCollections = 0;

  /* ---------------------------- View ---------------------------- */
  function openView(user) {
    setEditUser(null);
    setViewUser(user);
  }
  function closeView() {
    setViewUser(null);
  }

  /* ---------------------------- Edit ---------------------------- */
  function openEdit(user) {
    setViewUser(null);
    setEditUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role, phone: user.phone });
  }
  function closeEdit() {
    setEditUser(null);
  }
  async function saveEdit() {
    try {
      await userService.updateUser(editUser.id, {
        full_name: editForm.name,
        email: editForm.email,
        role: editForm.role.toLowerCase(),
        phone_number: editForm.phone,
      });
      setUsers((prev) => prev.map((u) => (u.id === editUser.id ? { ...u, ...editForm } : u)));
      fireToast(`${editForm.name}'s details were updated`);
      closeEdit();
    } catch (err) {
      fireToast(err.response?.data?.detail || "Failed to update user");
    }
  }

  /* ------------------------ Deactivate ---------------------------- */
  function openDeactivate(user) {
    setDeactivateUser(user);
  }
  function closeDeactivate() {
    setDeactivateUser(null);
  }
  async function confirmDeactivate() {
    try {
      await userService.toggleUserStatus(deactivateUser.id);
      const nextStatus = deactivateUser.status === "Active" ? "Inactive" : "Active";
      setUsers((prev) => prev.map((u) => (u.id === deactivateUser.id ? { ...u, status: nextStatus } : u)));
      fireToast(`${deactivateUser.name} is now ${nextStatus.toLowerCase()}`);
      setViewUser((v) => (v && v.id === deactivateUser.id ? { ...v, status: nextStatus } : v));
      closeDeactivate();
    } catch (err) {
      fireToast(err.response?.data?.detail || "Failed to update user status");
    }
  }

  /* --------------------------- Delete ------------------------------ */
  function openDelete(user) {
    setDeleteUser(user);
  }
  function closeDelete() {
    setDeleteUser(null);
  }
  async function confirmDelete() {
    try {
      await userService.deleteUser(deleteUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      fireToast(`${deleteUser.name} was deleted`);
      if (viewUser && viewUser.id === deleteUser.id) setViewUser(null);
      if (editUser && editUser.id === deleteUser.id) setEditUser(null);
      closeDelete();
    } catch (err) {
      fireToast(err.response?.data?.detail || "Failed to delete user");
    }
  }

  /* --------------------------- Create ------------------------------ */
  function openCreate() {
    setCreateForm({ name: "", email: "", phone: "", password: "", role: "Worker" });
    setShowCreate(true);
  }
  function closeCreate() {
    setShowCreate(false);
  }
  async function submitCreate() {
    if (!createForm.name.trim() || !createForm.email.trim()) {
      fireToast("Full name and email are required");
      return;
    }
    try {
      const created = await userService.createUser({
        full_name: createForm.name.trim(),
        email: createForm.email.trim(),
        phone_number: createForm.phone.trim(),
        password: createForm.password,
        role: createForm.role.toLowerCase(),
      });
      const newUser = {
        id: created.id || created._id || Date.now(),
        name: created.full_name || createForm.name.trim(),
        email: created.email || createForm.email.trim(),
        role: createForm.role,
        status: "Active",
        phone: created.phone_number || createForm.phone.trim() || "—",
      };
      setUsers((prev) => [newUser, ...prev]);
      fireToast(`${newUser.name} was added`);
      closeCreate();
    } catch (err) {
      fireToast(err.response?.data?.detail || "Failed to create user");
    }
  }

  const anyDrawerOpen = Boolean(viewUser || editUser);

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

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0B3D2E]/95 backdrop-blur-md shadow-lg">
        <div className="w-full px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0DBF78] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>

            <div className="leading-none">
              <p className="font-bold text-[19px] tracking-[-0.02em]">
                <span className="text-white">Urban</span>
                <span className="text-[#0DBF78]">Pulse</span>
              </p>

              <p className="mt-1 text-[11px] font-medium text-[#A7D8CB]">
                Smart Waste Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
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
                  <div className="px-4 py-3 text-sm text-gray-600 border-b border-gray-50">Bin #214 reported full in Sector 4.</div>
                  <div className="px-4 py-3 text-sm text-gray-600 border-b border-gray-50">Worker John Doe completed route A-3.</div>
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
              >
                <Avatar name={adminUser.name} role={adminUser.role} size="w-9 h-9 text-xs" />
                <div className="text-left leading-tight hidden sm:block">
                  <p className="text-white text-sm font-semibold">{adminUser.name}</p>
                  <p className="text-emerald-200/70 text-[11px]">{adminUser.role}</p>
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
                      authService.logout();
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

      {/* Floating Navigation Cards */}
      <section className="max-w-6xl mx-auto px-6 pt-8 pb-2 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Users */}
          <button
            onClick={() => {
  document.getElementById("admin-dashboard")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}}
            className="group relative bg-white/90 backdrop-blur-xl rounded-2xl
                       border border-emerald-100
                       shadow-lg shadow-emerald-900/10
                       px-5 py-4
                       flex items-center gap-4
                       text-left
                       transition-all duration-300
                       hover:-translate-y-1
                       hover:shadow-xl
                       hover:border-emerald-300"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-100
                            flex items-center justify-center
                            group-hover:bg-emerald-600
                            transition-colors duration-300">
              <Users className="w-5 h-5 text-emerald-700 group-hover:text-white" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#0B3D2E]">
                Users
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage system users
              </p>
            </div>
          </button>


          {/* Concerns Management */}
          <button
            className="group relative bg-white/90 backdrop-blur-xl rounded-2xl
                       border border-emerald-100
                       shadow-lg shadow-emerald-900/10
                       px-5 py-4
                       flex items-center gap-4
                       text-left
                       transition-all duration-300
                       hover:-translate-y-1
                       hover:shadow-xl
                       hover:border-amber-300"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-100
                            flex items-center justify-center
                            group-hover:bg-amber-500
                            transition-colors duration-300">
              <AlertTriangle className="w-5 h-5 text-amber-600 group-hover:text-white" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#0B3D2E]">
                Concerns
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage citizen reports
              </p>
            </div>
          </button>


          {/* Routes & Map */}
          <button
            className="group relative bg-white/90 backdrop-blur-xl rounded-2xl
                       border border-emerald-100
                       shadow-lg shadow-emerald-900/10
                       px-5 py-4
                       flex items-center gap-4
                       text-left
                       transition-all duration-300
                       hover:-translate-y-1
                       hover:shadow-xl
                       hover:border-blue-300"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-100
                            flex items-center justify-center
                            group-hover:bg-blue-600
                            transition-colors duration-300">
              <Map className="w-5 h-5 text-blue-600 group-hover:text-white" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#0B3D2E]">
                Routes & Map
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                View collection routes
              </p>
            </div>
          </button>


          {/* Suggestion Review */}
          <button
            className="group relative bg-white/90 backdrop-blur-xl rounded-2xl
                       border border-emerald-100
                       shadow-lg shadow-emerald-900/10
                       px-5 py-4
                       flex items-center gap-4
                       text-left
                       transition-all duration-300
                       hover:-translate-y-1
                       hover:shadow-xl
                       hover:border-purple-300"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-100
                            flex items-center justify-center
                            group-hover:bg-purple-600
                            transition-colors duration-300">
              <MessageSquare className="w-5 h-5 text-purple-600 group-hover:text-white" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#0B3D2E]">
                Suggestions
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Review suggestions
              </p>
            </div>
          </button>

        </div>
      </section>


      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 pt-8 pb-8">
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl ring-1 ring-white/60 border border-white/40 p-6 sm:p-8">
          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0B3D2E]">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage all system users, their roles, and account status.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setDateRangeOpen((o) => !o)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:border-emerald-300 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {dateRange}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dateRangeOpen ? "rotate-180" : ""}`} />
                </button>
                {dateRangeOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl ring-1 ring-black/5 overflow-hidden animate-scaleIn origin-top-right z-20">
                    {DATE_RANGES.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setDateRange(r);
                          setDateRangeOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition-colors ${r === dateRange ? "text-emerald-700 font-medium" : "text-gray-600"}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={openCreate}
                className="flex items-center gap-1.5 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-900/10 transition-all"
              >
                <Plus className="w-4 h-4" /> New User
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 mb-5 flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white rounded-xl p-1 border border-gray-200 w-fit">
              {ROLE_FILTERS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    roleFilter === r ? "bg-[#0B3D2E] text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 bg-white rounded-xl p-1 border border-gray-200 w-fit">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === s ? "bg-emerald-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="text-left font-semibold px-5 py-3">Name</th>
                    <th className="text-left font-semibold px-5 py-3">Email</th>
                    <th className="text-left font-semibold px-5 py-3">Role</th>
                    <th className="text-left font-semibold px-5 py-3">Status</th>
                    <th className="text-left font-semibold px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedUsers.map((u) => (
                    <tr key={u.id} className="border-t border-gray-100 hover:bg-emerald-50/40 transition-colors">
                      <td className="px-5 py-3">
                        <button onClick={() => openView(u)} className="flex items-center gap-3 group text-left">
                          <Avatar name={u.name} role={u.role} />
                          <span className="font-medium text-gray-800 group-hover:text-emerald-700 transition-colors">{u.name}</span>
                        </button>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{u.email}</td>
                      <td className="px-5 py-3">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-5 py-3">
                        <StatusPill status={u.status} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => openView(u)}
                            className="flex items-center gap-1 text-xs font-medium text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                          <button
                            onClick={() => openEdit(u)}
                            className="flex items-center gap-1 text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => openDeactivate(u)}
                            className="flex items-center gap-1 text-xs font-medium text-amber-600 border border-amber-200 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            {u.status === "Active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            {u.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => openDelete(u)}
                            className="text-red-500 border border-red-200 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                            aria-label={`Delete ${u.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pagedUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
                        No users match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1">
            <p className="text-xs text-gray-400">
              {filteredUsers.length === 0
                ? "Showing 0 of 0 users"
                : `Showing ${pageStart + 1}-${Math.min(pageStart + PAGE_SIZE, filteredUsers.length)} of ${filteredUsers.length} users`}
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === currentPage ? "bg-[#0B3D2E] text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                ›
              </button>
            </div>
          </div>
        </div>
            </main>

      {/* ================================================================ */}
      {/* Analytics Section                                                 */}
      {/* ================================================================ */}

      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="mb-5 px-1 flex items-center justify-between">

  {/* Left: Analytics Overview */}
  <div className="flex items-center gap-3">
    <div className="w-1 h-6 rounded-full bg-emerald-500"></div>

    <h2 className="text-lg font-bold text-[#0B3D2E]">
      Analytics Overview
    </h2>
  </div>

  {/* Right: Description */}
  <p className="text-xs sm:text-sm text-gray-400">
    Real-time overview of system activity
  </p>

</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

          {/* Total Users */}
          <div className="group bg-white/90 backdrop-blur-xl rounded-2xl
                          border border-emerald-100
                          shadow-lg shadow-emerald-900/10
                          p-5
                          transition-all duration-300
                          hover:-translate-y-1 hover:shadow-xl">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Users
                </p>

                <p className="text-3xl font-bold text-[#0B3D2E] mt-2">
                  {totalUsers}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  All registered users
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-emerald-100
                              flex items-center justify-center
                              group-hover:bg-emerald-600
                              transition-colors">
                <Users className="w-5 h-5 text-emerald-700 group-hover:text-white" />
              </div>
            </div>
          </div>


          {/* Total Workers */}
          <div className="group bg-white/90 backdrop-blur-xl rounded-2xl
                          border border-blue-100
                          shadow-lg shadow-blue-900/10
                          p-5
                          transition-all duration-300
                          hover:-translate-y-1 hover:shadow-xl">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Workers
                </p>

                <p className="text-3xl font-bold text-[#0B3D2E] mt-2">
                  {totalWorkers}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Registered workers
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-100
                              flex items-center justify-center
                              group-hover:bg-blue-600
                              transition-colors">
                <UserCheck className="w-5 h-5 text-blue-600 group-hover:text-white" />
              </div>
            </div>
          </div>


          {/* Pending Concerns */}
          <div className="group bg-white/90 backdrop-blur-xl rounded-2xl
                          border border-amber-100
                          shadow-lg shadow-amber-900/10
                          p-5
                          transition-all duration-300
                          hover:-translate-y-1 hover:shadow-xl">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending Concerns
                </p>

                <p className="text-3xl font-bold text-[#0B3D2E] mt-2">
                  {pendingConcerns}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Need attention
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-amber-100
                              flex items-center justify-center
                              group-hover:bg-amber-500
                              transition-colors">
                <AlertTriangle className="w-5 h-5 text-amber-600 group-hover:text-white" />
              </div>
            </div>
          </div>


          {/* Resolved Concerns */}
          <div className="group bg-white/90 backdrop-blur-xl rounded-2xl
                          border border-green-100
                          shadow-lg shadow-green-900/10
                          p-5
                          transition-all duration-300
                          hover:-translate-y-1 hover:shadow-xl">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Resolved Concerns
                </p>

                <p className="text-3xl font-bold text-[#0B3D2E] mt-2">
                  {resolvedConcerns}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Successfully resolved
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-green-100
                              flex items-center justify-center
                              group-hover:bg-green-600
                              transition-colors">
                <CheckCircle2 className="w-5 h-5 text-green-600 group-hover:text-white" />
              </div>
            </div>
          </div>


          {/* Today's Collections */}
          <div className="group bg-white/90 backdrop-blur-xl rounded-2xl
                          border border-purple-100
                          shadow-lg shadow-purple-900/10
                          p-5
                          transition-all duration-300
                          hover:-translate-y-1 hover:shadow-xl">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Today Collections
                </p>

                <p className="text-3xl font-bold text-[#0B3D2E] mt-2">
                  {todayCollections}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Completed today
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-purple-100
                              flex items-center justify-center
                              group-hover:bg-purple-600
                              transition-colors">
                <Map className="w-5 h-5 text-purple-600 group-hover:text-white" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Shared soft backdrop */}
      <div
        onClick={() => {
          closeView();
          closeEdit();
        }}
        className={`fixed inset-0 bg-black/10 backdrop-blur-[1px] z-40 transition-opacity duration-300 ${
          anyDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* User Details — Center Modal */}
      <div
        onClick={closeView}
        className={`fixed inset-0 z-50 flex items-center justify-center
          bg-black/40 backdrop-blur-sm p-4 transition-opacity duration-200
          ${
            viewUser
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative bg-white rounded-2xl shadow-2xl
            w-full max-w-md p-6
            transition-transform duration-200
            ${viewUser ? "scale-100" : "scale-95"}`}
        >
          {viewUser && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#0B3D2E]">
                  User Details
                </h2>

                <button
                  onClick={closeView}
                  className="text-gray-400 hover:text-gray-600
                             hover:bg-gray-100 rounded-full p-1.5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User */}
              <div className="flex items-center gap-4 mb-6">
                <Avatar
                  name={viewUser.name}
                  role={viewUser.role}
                  size="w-16 h-16 text-lg"
                />

                <div>
                  <p className="font-bold text-gray-800 text-lg">
                    {viewUser.name}
                  </p>

                  <StatusPill status={viewUser.status} />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5" />

                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm text-gray-700 font-medium">
                      {viewUser.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
                  <Shield className="w-4 h-4 text-gray-400 mt-0.5" />

                  <div>
                    <p className="text-xs text-gray-400">Role</p>
                    <RoleBadge role={viewUser.role} />
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5" />

                  <div>
                    <p className="text-xs text-gray-400">Phone Number</p>
                    <p className="text-sm text-gray-700 font-medium">
                      {viewUser.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => openEdit(viewUser)}
                  className="w-full py-2.5 rounded-xl bg-[#0B3D2E]
                             text-white text-sm font-semibold
                             hover:bg-[#0f4c39] transition-colors"
                >
                  Edit Details
                </button>

                <button
                  onClick={() => openDeactivate(viewUser)}
                  className="w-full py-2.5 rounded-xl border
                             border-amber-300 text-amber-600
                             text-sm font-semibold hover:bg-amber-50"
                >
                  {viewUser.status === "Active"
                    ? "Deactivate"
                    : "Activate"}
                </button>

                <button
                  onClick={() => openDelete(viewUser)}
                  className="w-full py-2.5 rounded-xl border
                             border-red-200 text-red-600
                             text-sm font-semibold hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT drawer — Edit User */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${
          editUser ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {editUser && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#0B3D2E]">Edit User</h2>
              <button onClick={closeEdit} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Full Name">
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400"
                />
              </Field>
              <Field label="Email Address">
                <input
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400"
                />
              </Field>
              <Field label="Role">
                <div className="flex items-center gap-4 pt-1">
                  {ROLES.map((r) => (
                    <label key={r} className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="radio"
                        checked={editForm.role === r}
                        onChange={() => setEditForm({ ...editForm, role: r })}
                        className="accent-emerald-600"
                      />
                      {r}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Phone Number">
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400"
                />
              </Field>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button onClick={closeEdit} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={saveEdit} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors">
                Save
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Create User — floating modal */}
      <Modal open={showCreate} onClose={closeCreate}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#0B3D2E]">Create User</h2>
          <button onClick={closeCreate} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <Field label="Full Name">
            <input
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="Enter full name"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400"
            />
          </Field>
          <Field label="Email Address">
            <input
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              placeholder="Enter email address"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400"
            />
          </Field>
          <Field label="Phone Number">
            <input
              value={createForm.phone}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              placeholder="Enter phone number"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400"
            />
          </Field>
          <Field label="Temporary Password">
            <input
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              placeholder="Enter temporary password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400"
            />
          </Field>
          <Field label="Assign Role">
            <div className="flex items-center gap-4 pt-1">
              {ROLES.map((r) => (
                <label key={r} className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    checked={createForm.role === r}
                    onChange={() => setCreateForm({ ...createForm, role: r })}
                    className="accent-emerald-600"
                  />
                  {r}
                </label>
              ))}
            </div>
          </Field>
        </div>
        <button
          onClick={submitCreate}
          className="w-full mt-7 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-sm font-semibold hover:from-emerald-600 hover:to-emerald-800 transition-all"
        >
          Done
        </button>
      </Modal>

      {/* Deactivate / Activate modal */}
      <Modal open={Boolean(deactivateUser)} onClose={closeDeactivate}>
        {deactivateUser && (
          <>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <h2 className="text-lg font-bold text-[#0B3D2E]">
                {deactivateUser.status === "Active" ? "Deactivate User" : "Activate User"}
              </h2>
            </div>
            <div className="space-y-4">
              <Field label="Full Name">
                <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 text-sm text-gray-700">{deactivateUser.name}</div>
              </Field>
              <Field label="Email Address">
                <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 text-sm text-gray-700">{deactivateUser.email}</div>
              </Field>
              <Field label="Role">
                <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 text-sm text-gray-700">{deactivateUser.role}</div>
              </Field>
              <Field label="Current Status">
                <div className="px-3.5 py-2.5 rounded-xl bg-gray-50">
                  <StatusPill status={deactivateUser.status} />
                </div>
              </Field>
            </div>
            <div className="flex items-center gap-3 mt-7">
              <button onClick={closeDeactivate} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmDeactivate}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${
                  deactivateUser.status === "Active" ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {deactivateUser.status === "Active" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={Boolean(deleteUser)} onClose={closeDelete} narrow>
        {deleteUser && (
          <div className="text-center py-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-red-600 mx-auto">Delete User Account?</h2>
              <button onClick={closeDelete} className="text-gray-400 hover:text-gray-600 absolute right-6 top-6">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto my-4">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-sm text-gray-500 px-2 mb-7">
              Are you sure you want to delete <span className="font-semibold text-gray-700">{deleteUser.name}</span>'s account? This action
              cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">
                Confirm Delete
              </button>
              <button onClick={closeDelete} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

            <Toast message={toast} />

      {/* Floating AI Chatbot */}
      <FloatingChatbot />

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
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${narrow ? "max-w-sm" : "max-w-md"} p-6 transition-transform duration-200 ${
          open ? "scale-100" : "scale-95"
        }`}
      >
        {children}
      </div>
    </div>
  );
}