import React from "react";
import { CheckCircle2, AlertTriangle, ClipboardList, Clock } from "lucide-react";

export default function WorkerMetricStrip({
  completedStops = 0,
  totalStops = 0,
  assignedConcernsCount = 0,
  issuesReportedCount = 0,
  shiftStatus = "Active",
}) {
  const cards = [
    {
      title: "Route Stops",
      value: `${completedStops} / ${totalStops}`,
      subtitle:
        totalStops > 0
          ? `${Math.round((completedStops / totalStops) * 100)}% Complete`
          : "No stops assigned",
      icon: CheckCircle2,
      color: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-100",
    },
    {
      title: "Assigned Work Orders",
      value: assignedConcernsCount,
      subtitle: "Pending citizen issues",
      icon: ClipboardList,
      color: "text-blue-700",
      bg: "bg-blue-50 border-blue-100",
    },
    {
      title: "Issues Reported",
      value: issuesReportedCount,
      subtitle: "Blocked / skipped stops",
      icon: AlertTriangle,
      color: "text-amber-700",
      bg: "bg-amber-50 border-amber-100",
    },
    {
      title: "Shift Status",
      value: shiftStatus,
      subtitle: "In Progress",
      icon: Clock,
      color: "text-purple-700",
      bg: "bg-purple-50 border-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-4 rounded-2xl border ${c.bg} bg-white/80 backdrop-blur-md shadow-sm flex items-center gap-3`}
          >
            <div className={`p-2.5 rounded-xl ${c.bg} shrink-0`}>
              <Icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-500 truncate">
                {c.title}
              </p>
              <p className="text-base font-bold text-gray-900 leading-tight">
                {c.value}
              </p>
              <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">
                {c.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}