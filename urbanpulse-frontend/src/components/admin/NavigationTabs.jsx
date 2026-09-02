import React from "react";
import {
  Users,
  AlertTriangle,
  Map as MapIcon,
  MessageSquare,
  Trash2,
} from "lucide-react";

export default function NavigationTabs({ activeTab, onTabChange }) {
  const tabs = [
    {
      id: "users",
      title: "Users",
      description: "Manage system users",
      icon: Users,
      activeBg: "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/30",
      activeIcon: "bg-emerald-600 text-white",
      inactiveIcon: "bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white",
      hoverBorder: "hover:border-emerald-300",
    },
    {
      id: "concerns",
      title: "Concerns",
      description: "Manage citizen reports",
      icon: AlertTriangle,
      activeBg: "bg-amber-50 border-amber-500 ring-2 ring-amber-400/30",
      activeIcon: "bg-amber-500 text-white",
      inactiveIcon: "bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
      hoverBorder: "hover:border-amber-300",
    },
    {
      id: "routes",
      title: "Routes & Map",
      description: "View collection routes",
      icon: MapIcon,
      activeBg: "bg-blue-50 border-blue-500 ring-2 ring-blue-400/30",
      activeIcon: "bg-blue-600 text-white",
      inactiveIcon: "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
      hoverBorder: "hover:border-blue-300",
    },
    {
      id: "suggestions",
      title: "Suggestions",
      description: "Review suggestions",
      icon: MessageSquare,
      activeBg: "bg-purple-50 border-purple-500 ring-2 ring-purple-400/30",
      activeIcon: "bg-purple-600 text-white",
      inactiveIcon: "bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
      hoverBorder: "hover:border-purple-300",
    },
    {
      id: "bins",
      title: "Waste Bins",
      description: "Manage public bins",
      icon: Trash2,
      activeBg: "bg-teal-50 border-teal-500 ring-2 ring-teal-400/30",
      activeIcon: "bg-teal-600 text-white",
      inactiveIcon: "bg-teal-100 text-teal-600 group-hover:bg-teal-600 group-hover:text-white",
      hoverBorder: "hover:border-teal-300",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 pt-8 pb-2 relative z-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`group relative rounded-2xl border shadow-lg px-4 py-3.5 flex items-center gap-3.5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isActive
                  ? tab.activeBg
                  : `bg-white/90 border-emerald-100 ${tab.hoverBorder}`
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                  isActive ? tab.activeIcon : tab.inactiveIcon
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0B3D2E]">{tab.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{tab.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}