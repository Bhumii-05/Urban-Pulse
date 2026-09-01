import React from "react";
import { X, AlertTriangle, Mail, Shield, Phone } from "lucide-react";
import { Modal, Field, Avatar, RoleBadge, StatusPill } from "../../common/CommonUI";

const ROLES = ["Admin", "Worker"];

export function UserDetailsModal({ user, onClose, onOpenEdit, onOpenDeactivate, onOpenDelete }) {
  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity duration-200 ${
        user ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transition-transform duration-200 ${
          user ? "scale-100" : "scale-95"
        }`}
      >
        {user && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#0B3D2E]">User Details</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <Avatar name={user.name} role={user.role} size="w-16 h-16 text-lg" />
              <div>
                <p className="font-bold text-gray-800 text-lg">{user.name}</p>
                <StatusPill status={user.status} />
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm text-gray-700 font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
                <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Role</p>
                  <RoleBadge role={user.role} />
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Phone Number</p>
                  <p className="text-sm text-gray-700 font-medium">{user.phone}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => onOpenEdit(user)}
                className="w-full py-2.5 rounded-xl bg-[#0B3D2E] text-white text-sm font-semibold hover:bg-[#0f4c39] transition-colors"
              >
                Edit Details
              </button>
              <button
                onClick={() => onOpenDeactivate(user)}
                className="w-full py-2.5 rounded-xl border border-amber-300 text-amber-600 text-sm font-semibold hover:bg-amber-50"
              >
                {user.status === "Active" ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={() => onOpenDelete(user)}
                className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function EditUserDrawer({ editUser, editForm, setEditForm, onClose, onSave }) {
  return (
    <aside
      className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${
        editUser ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {editUser && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#0B3D2E]">Edit User</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <Field label="Full Name">
              <input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
            </Field>
            <Field label="Email Address">
              <input
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
            </Field>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

export function CreateUserModal({ open, form, setForm, onClose, onSubmit }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-[#0B3D2E]">Create User</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-4">
        <Field label="Full Name">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter full name"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
        </Field>
        <Field label="Email Address">
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Enter email address"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
        </Field>
        <Field label="Phone Number">
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Enter phone number"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
        </Field>
        <Field label="Temporary Password">
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Enter temporary password"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
        </Field>
        <Field label="Assign Role">
          <div className="flex items-center gap-4 pt-1">
            {ROLES.map((r) => (
              <label key={r} className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                <input
                  type="radio"
                  checked={form.role === r}
                  onChange={() => setForm({ ...form, role: r })}
                  className="accent-emerald-600"
                />
                {r}
              </label>
            ))}
          </div>
        </Field>
      </div>
      <button
        onClick={onSubmit}
        className="w-full mt-7 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-sm font-semibold hover:from-emerald-600 hover:to-emerald-800 transition-all"
      >
        Done
      </button>
    </Modal>
  );
}

export function DeactivateUserModal({ user, onClose, onConfirm }) {
  return (
    <Modal open={Boolean(user)} onClose={onClose}>
      {user && (
        <>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <h2 className="text-lg font-bold text-[#0B3D2E]">
              {user.status === "Active" ? "Deactivate User" : "Activate User"}
            </h2>
          </div>
          <div className="space-y-4">
            <Field label="Full Name">
              <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 text-sm text-gray-700">{user.name}</div>
            </Field>
            <Field label="Email Address">
              <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 text-sm text-gray-700">{user.email}</div>
            </Field>
            <Field label="Role">
              <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 text-sm text-gray-700">{user.role}</div>
            </Field>
            <Field label="Current Status">
              <div className="px-3.5 py-2.5 rounded-xl bg-gray-50">
                <StatusPill status={user.status} />
              </div>
            </Field>
          </div>
          <div className="flex items-center gap-3 mt-7">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${
                user.status === "Active" ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {user.status === "Active" ? "Deactivate" : "Activate"}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

export function DeleteUserModal({ user, onClose, onConfirm }) {
  return (
    <Modal open={Boolean(user)} onClose={onClose} narrow>
      {user && (
        <div className="text-center py-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-red-600 mx-auto">Delete User Account?</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 absolute right-6 top-6">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto my-4">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-sm text-gray-500 px-2 mb-7">
            Are you sure you want to delete <span className="font-semibold text-gray-700">{user.name}</span>'s account? This action cannot be undone.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Confirm Delete
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}