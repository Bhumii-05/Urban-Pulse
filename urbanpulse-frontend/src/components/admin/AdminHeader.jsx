import React, { useState } from "react";
import { Leaf, ChevronDown, User as UserIcon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../api/auth.service";
import NotificationDropdown from "../NotificationDropdown";
import { Avatar } from "../common/CommonUI";

export default function AdminHeader({ adminUser }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  return (
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
          <NotificationDropdown />
          <div className="w-px h-8 bg-white/15" />

          <div className="relative">
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-2.5 hover:bg-white/10 rounded-full pl-1 pr-2 py-1 transition-colors"
            >
              <Avatar
                name={adminUser.name}
                role={adminUser.role}
                size="w-9 h-9 text-xs"
              />
              <div className="text-left leading-tight hidden sm:block">
                <p className="text-white text-sm font-semibold">
                  {adminUser.name}
                </p>
                <p className="text-emerald-200/70 text-[11px]">
                  {adminUser.role}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-emerald-200/70 transition-transform ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl ring-1 ring-black/5 overflow-hidden animate-scaleIn origin-top-right">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 transition-colors"
                >
                  <UserIcon className="w-4 h-4" /> Profile
                </button>
                <button
                  onClick={() => authService.logout()}
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
  );
}