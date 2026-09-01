import React, { useState, useEffect, useMemo } from "react";
import {
  User as UserIcon,
  Calendar,
  ChevronDown,
  Plus,
  Search,
  Eye,
  Pencil,
  UserX,
  UserCheck,
  Trash2,
  Mail,
  Shield,
  Phone,
  X,
  AlertTriangle,
} from "lucide-react";
import { userService } from "../../../api/admin.service";
import {
  Avatar,
  RoleBadge,
  StatusPill,
  Modal,
  Field,
} from "../../common/CommonUI";

const ROLES = ["Admin", "Worker"];
const ROLE_FILTERS = ["All", "Admin", "Worker", "Citizen"];
const STATUS_FILTERS = ["All", "Active", "Inactive"];
const DATE_RANGES = ["Today", "Last 7 days", "Last 30 days"];
const PAGE_SIZE = 4;

export default function UserManagement({ fireToast }) {
  // Defensive state initialization
  const [users, setUsers] = useState([]);
  const [workersList, setWorkersList] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState(DATE_RANGES[0]);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);

  // Modals & Drawers
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "Worker",
    phone: "",
  });
  const [deactivateUser, setDeactivateUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Worker",
  });

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      const list = Array.isArray(data) ? data : data?.users || [];
      const normalized = list.map((u) => ({
        id: u.id || u._id,
        name: u.full_name || u.name || "User",
        email: u.email || "",
        role: u.role
          ? u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase()
          : "Citizen",
        status:
          u.is_active === false || u.status === "Inactive"
            ? "Inactive"
            : "Active",
        phone: u.phone_number || u.phone || "—",
      }));

      setUsers(normalized);
      setWorkersList(normalized.filter((u) => u.role === "Worker"));
    } catch (err) {
      setUsers([]);
      setWorkersList([]);
      if (fireToast) {
        fireToast(err.response?.data?.detail || "Failed to load users");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  // Safe Memo Guard
  const filteredUsers = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    return list.filter((u) => {
      const nameMatch = (u.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());
      const emailMatch = (u.email || "")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesSearch = nameMatch || emailMatch;
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      const matchesStatus = statusFilter === "All" || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pagedUsers = filteredUsers.slice(pageStart, pageStart + PAGE_SIZE);

  // User Actions
  const handleSaveEdit = async () => {
    try {
      await userService.updateUser(editUser.id, {
        full_name: editForm.name,
        email: editForm.email,
        role: editForm.role.toLowerCase(),
        phone_number: editForm.phone,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === editUser.id ? { ...u, ...editForm } : u)),
      );
      if (fireToast) fireToast(`${editForm.name}'s details were updated`);
      setEditUser(null);
    } catch (err) {
      if (fireToast)
        fireToast(err.response?.data?.detail || "Failed to update user");
    }
  };

  const handleConfirmDeactivate = async () => {
  if (!deactivateUser) return;

  // If currently "Active", the next state should be false (inactive)
  const nextIsActive = deactivateUser.status !== "Active";
  const nextStatus = nextIsActive ? "Active" : "Inactive";

  try {
    await userService.toggleUserStatus(deactivateUser.id, nextIsActive);

    // Update state in user table
    setUsers((prev) =>
      prev.map((u) =>
        u.id === deactivateUser.id ? { ...u, status: nextStatus } : u
      )
    );

    if (viewUser && viewUser.id === deactivateUser.id) {
      setViewUser((v) => ({ ...v, status: nextStatus }));
    }

    if (fireToast) {
      fireToast(`${deactivateUser.name} is now ${nextStatus.toLowerCase()}`);
    }

    setDeactivateUser(null);
  } catch (err) {
    const detail = err.response?.data?.detail;
    const errorMsg = Array.isArray(detail)
      ? detail[0]?.msg || "Validation error"
      : typeof detail === "string"
      ? detail
      : "Failed to update user status";

    if (fireToast) {
      fireToast(errorMsg);
    }
  }
};

  const handleConfirmDelete = async () => {
    try {
      await userService.deleteUser(deleteUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      if (fireToast) fireToast(`${deleteUser.name} was deleted`);
      if (viewUser && viewUser.id === deleteUser.id) setViewUser(null);
      if (editUser && editUser.id === deleteUser.id) setEditUser(null);
      setDeleteUser(null);
    } catch (err) {
      if (fireToast)
        fireToast(err.response?.data?.detail || "Failed to delete user");
    }
  };

  const handleSubmitCreate = async () => {
    if (!createForm.name.trim() || !createForm.email.trim()) {
      if (fireToast) fireToast("Full name and email are required");
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
      if (newUser.role === "Worker") {
        setWorkersList((prev) => [newUser, ...prev]);
      }
      if (fireToast) fireToast(`${newUser.name} was added`);
      setShowCreate(false);
    } catch (err) {
      if (fireToast)
        fireToast(err.response?.data?.detail || "Failed to create user");
    }
  };

  return (
    <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl ring-1 ring-white/60 border border-white/40 p-6 sm:p-8">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0B3D2E]">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Manage all system users, their roles, and account status.
            </p>
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
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  dateRangeOpen ? "rotate-180" : ""
                }`}
              />
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
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition-colors ${
                      r === dateRange
                        ? "text-emerald-700 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setCreateForm({
                name: "",
                email: "",
                phone: "",
                password: "",
                role: "Worker",
              });
              setShowCreate(true);
            }}
            className="flex items-center gap-1.5 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-900/10 transition-all"
          >
            <Plus className="w-4 h-4" /> New User
          </button>
        </div>
      </div>

      {/* Filter Bar */}
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
                roleFilter === r
                  ? "bg-[#0B3D2E] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
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
                statusFilter === s
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-5 py-3 pl-20 text-left font-semibold">
                  Name
                </th>
                <th className="px-5 py-3 text-left font-semibold">Email</th>
                <th className="px-5 py-3 text-left font-semibold">Role</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="w-[340px] min-w-[340px] px-5 py-3 text-center font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedUsers.map((u) => (
                <tr
                  key={u.id}
                  className="transition-colors hover:bg-emerald-50/40"
                >
                  {/* Name */}
                  <td className="px-8 py-4">
                    <button
                      type="button"
                      onClick={() => setViewUser(u)}
                      className="group flex items-center gap-3 text-left"
                    >
                      <Avatar name={u.name} role={u.role} />
                      <span className="font-medium text-gray-800 transition-colors group-hover:text-emerald-700">
                        {u.name}
                      </span>
                    </button>
                  </td>

                  {/* Email */}
                  <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                    {u.email}
                  </td>

                  {/* Role */}
                  <td className="whitespace-nowrap px-5 py-4">
                    <RoleBadge role={u.role} />
                  </td>

                  {/* Status */}
                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusPill status={u.status} />
                  </td>

                  {/* Actions (Fixed Width Column & Centered Locked Buttons) */}
                  <td className="w-[340px] min-w-[340px] px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      {/* View */}
                      <button
                        type="button"
                        onClick={() => setViewUser(u)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditUser(u);
                          setEditForm({
                            name: u.name,
                            email: u.email,
                            role: u.role,
                            phone: u.phone,
                          });
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>

                      {/* Activate / Deactivate (Fixed width w-[104px] prevents jumping) */}
                      <button
                        type="button"
                        onClick={() => setDeactivateUser(u)}
                        className="w-[104px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 py-1.5 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-50"
                      >
                        {u.status === "Active" ? (
                          <UserX className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <UserCheck className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span>
                          {u.status === "Active" ? "Deactivate" : "Activate"}
                        </span>
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setDeleteUser(u)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete user"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {pagedUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-gray-400"
                  >
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1">
        <p className="text-xs text-gray-400">
          {filteredUsers.length === 0
            ? "Showing 0 of 0 users"
            : `Showing ${pageStart + 1}-${Math.min(
                pageStart + PAGE_SIZE,
                filteredUsers.length,
              )} of ${filteredUsers.length} users`}
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
                p === currentPage
                  ? "bg-[#0B3D2E] text-white"
                  : "border border-gray-200 text-gray-500 hover:bg-gray-50"
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

      {/* View User Modal */}
      <Modal open={Boolean(viewUser)} onClose={() => setViewUser(null)}>
        {viewUser && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#0B3D2E]">User Details</h2>
              <button
                onClick={() => setViewUser(null)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setEditUser(viewUser);
                  setEditForm({
                    name: viewUser.name,
                    email: viewUser.email,
                    role: viewUser.role,
                    phone: viewUser.phone,
                  });
                  setViewUser(null);
                }}
                className="w-full py-2.5 rounded-xl bg-[#0B3D2E] text-white text-sm font-semibold hover:bg-[#0f4c39] transition-colors"
              >
                Edit Details
              </button>
              <button
                onClick={() => {
                  setDeactivateUser(viewUser);
                  setViewUser(null);
                }}
                className="w-full py-2.5 rounded-xl border border-amber-300 text-amber-600 text-sm font-semibold hover:bg-amber-50"
              >
                {viewUser.status === "Active" ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={() => {
                  setDeleteUser(viewUser);
                  setViewUser(null);
                }}
                className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Edit User Drawer - Only render when editUser is not null */}

      <Modal open={Boolean(editUser)} onClose={() => setEditUser(null)}>
        {editUser && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#0B3D2E]">Edit User</h2>
              <button
                onClick={() => setEditUser(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Full Name">
                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </Field>
              <Field label="Email Address">
                <input
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </Field>
              <Field label="Role">
                <div className="flex items-center gap-4 pt-1">
                  {ROLES.map((r) => (
                    <label
                      key={r}
                      className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer"
                    >
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
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </Field>
            </div>

            <div className="flex items-center gap-3 mt-7">
              <button
                onClick={() => setEditUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create User Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#0B3D2E]">Create User</h2>
          <button
            onClick={() => setShowCreate(false)}
            className="text-gray-400 hover:text-gray-600 rounded-full p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <Field label="Full Name">
            <input
              value={createForm.name}
              onChange={(e) =>
                setCreateForm({ ...createForm, name: e.target.value })
              }
              placeholder="Enter full name"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </Field>
          <Field label="Email Address">
            <input
              value={createForm.email}
              onChange={(e) =>
                setCreateForm({ ...createForm, email: e.target.value })
              }
              placeholder="Enter email address"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </Field>
          <Field label="Phone Number">
            <input
              value={createForm.phone}
              onChange={(e) =>
                setCreateForm({ ...createForm, phone: e.target.value })
              }
              placeholder="Enter phone number"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </Field>
          <Field label="Temporary Password">
            <input
              type="password"
              value={createForm.password}
              onChange={(e) =>
                setCreateForm({ ...createForm, password: e.target.value })
              }
              placeholder="Enter temporary password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </Field>
          <Field label="Assign Role">
            <div className="flex items-center gap-4 pt-1">
              {ROLES.map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer"
                >
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
          onClick={handleSubmitCreate}
          className="w-full mt-7 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-sm font-semibold hover:from-emerald-600 hover:to-emerald-800 transition-all"
        >
          Done
        </button>
      </Modal>

      {/* Deactivate User Confirmation */}
      <Modal
        open={Boolean(deactivateUser)}
        onClose={() => setDeactivateUser(null)}
      >
        {deactivateUser && (
          <>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <h2 className="text-lg font-bold text-[#0B3D2E]">
                {deactivateUser.status === "Active"
                  ? "Deactivate User"
                  : "Activate User"}
              </h2>
            </div>
            <div className="space-y-4">
              <Field label="Full Name">
                <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 text-sm text-gray-700">
                  {deactivateUser.name}
                </div>
              </Field>
              <Field label="Email Address">
                <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 text-sm text-gray-700">
                  {deactivateUser.email}
                </div>
              </Field>
              <Field label="Role">
                <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 text-sm text-gray-700">
                  {deactivateUser.role}
                </div>
              </Field>
              <Field label="Current Status">
                <div className="px-3.5 py-2.5 rounded-xl bg-gray-50">
                  <StatusPill status={deactivateUser.status} />
                </div>
              </Field>
            </div>
            <div className="flex items-center gap-3 mt-7">
              <button
                onClick={() => setDeactivateUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeactivate}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${
                  deactivateUser.status === "Active"
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {deactivateUser.status === "Active" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Delete User Confirmation */}
      <Modal
        open={Boolean(deleteUser)}
        onClose={() => setDeleteUser(null)}
        narrow
      >
        {deleteUser && (
          <div className="text-center py-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-red-600 mx-auto">
                Delete User Account?
              </h2>
              <button
                onClick={() => setDeleteUser(null)}
                className="text-gray-400 hover:text-gray-600 absolute right-6 top-6"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto my-4">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-sm text-gray-500 px-2 mb-7">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">
                {deleteUser.name}
              </span>
              's account? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setDeleteUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
