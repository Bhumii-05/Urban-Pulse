import React, { useState } from "react";
import { Leaf, ChevronDown, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../api/auth.service";
import NotificationDropdown from "../NotificationDropdown";

function getInitials(name) {
  if (!name) return "CZ";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function CitizenHeader({ userProfile }) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const userName = userProfile?.full_name || userProfile?.name || "Citizen User";

  return (
    <header className="sticky top-3 z-40 mx-3 rounded-2xl bg-gradient-to-r from-[#005B4F] to-[#00473e] shadow-lg">
      <div className="flex w-full items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm">
            <Leaf className="h-6 w-6 text-white" strokeWidth={2.25} />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-lg font-bold text-white">
              Urban<span className="text-emerald-400">Pulse</span>
            </p>
            <p className="truncate text-[11px] font-medium text-emerald-200/70">
              Smart Waste Management
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <NotificationDropdown />
          <span className="hidden h-8 w-px bg-white/15 sm:block" />

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-3 rounded-full py-1 pl-1.5 pr-2.5 transition hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#123524] shadow-sm ring-2 ring-white/20">
                {getInitials(userName)}
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-sm font-bold text-white">
                  {userName}
                </span>
                <span className="block text-[11px] text-emerald-200/70">
                  Citizen
                </span>
              </span>
              <ChevronDown className="hidden h-4 w-4 text-emerald-100/70 sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 z-50 divide-y divide-slate-100">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <User className="h-4 w-4 text-slate-500" />
                  Profile
                </button>
                <button
                  onClick={() => authService.logout()}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}