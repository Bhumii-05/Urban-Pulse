import React from "react";
import {
  Users,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Map as MapIcon,
} from "lucide-react";

export default function AnalyticsSection({ analytics }) {
  const cards = [
    {
      title: "Total Users",
      value: analytics.totalUsers,
      desc: "All registered users",
      icon: Users,
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      hover: "group-hover:bg-emerald-600",
      shadow: "shadow-emerald-900/10",
      border: "border-emerald-100",
    },
    {
      title: "Total Workers",
      value: analytics.totalWorkers,
      desc: "Registered workers",
      icon: UserCheck,
      bg: "bg-blue-100",
      text: "text-blue-600",
      hover: "group-hover:bg-blue-600",
      shadow: "shadow-blue-900/10",
      border: "border-blue-100",
    },
    {
      title: "Pending Concerns",
      value: analytics.pendingConcerns,
      desc: "Need attention",
      icon: AlertTriangle,
      bg: "bg-amber-100",
      text: "text-amber-600",
      hover: "group-hover:bg-amber-500",
      shadow: "shadow-amber-900/10",
      border: "border-amber-100",
    },
    {
      title: "Resolved Concerns",
      value: analytics.resolvedConcerns,
      desc: "Successfully resolved",
      icon: CheckCircle2,
      bg: "bg-green-100",
      text: "text-green-600",
      hover: "group-hover:bg-green-600",
      shadow: "shadow-green-900/10",
      border: "border-green-100",
    },
    {
      title: "Completed Routes",
      value: analytics.completedRoutes,
      desc: "Finished pickups",
      icon: MapIcon,
      bg: "bg-purple-100",
      text: "text-purple-600",
      hover: "group-hover:bg-purple-600",
      shadow: "shadow-purple-900/10",
      border: "border-purple-100",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 pb-12">
      <div className="mb-5 px-1 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-emerald-500" />
          <h2 className="text-lg font-bold text-[#0B3D2E]">Analytics Overview</h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-400">
          Real-time overview of system activity
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`group bg-white/90 backdrop-blur-xl rounded-2xl border ${c.border} shadow-lg ${c.shadow} p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{c.title}</p>
                  <p className="text-3xl font-bold text-[#0B3D2E] mt-2">
                    {c.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{c.desc}</p>
                </div>
                <div
                  className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center ${c.hover} transition-colors`}
                >
                  <Icon className={`w-5 h-5 ${c.text} group-hover:text-white`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}