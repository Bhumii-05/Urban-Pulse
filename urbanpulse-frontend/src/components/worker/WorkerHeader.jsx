import React, { useState, useRef, useEffect } from "react";
import { Leaf, ChevronDown, User as UserIcon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "../NotificationDropdown";
import { authService } from "../../api/auth.service";

function getInitials(name) {
  if (!name) return "W";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function WorkerHeader({ userName = "Worker" }) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Proceed to login
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B3D2E]/95 backdrop-blur-md shadow-lg border-b border-emerald-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#0DBF78] flex items-center justify-center shadow-md">
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

        {/* Right Section: Notifications & Profile */}
        <div className="flex items-center gap-3.5">
          <NotificationDropdown />

          <div className="w-px h-7 bg-white/15" />

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-2.5 hover:bg-white/10 rounded-full pl-1 pr-2.5 py-1 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-emerald-400">
                {getInitials(userName)}
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <p className="text-white text-xs font-semibold">{userName}</p>
                <p className="text-emerald-200/70 text-[10px]">Worker</p>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-emerald-200/70 transition-transform ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden origin-top-right z-50 animate-scaleIn">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-emerald-50 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-gray-500" /> Profile
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                >
                  <LogOut className="w-4 h-4 text-red-500" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}