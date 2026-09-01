import React, { useState, useRef, useEffect } from "react";
import { Truck, ChevronDown, Check, Route as RouteIcon } from "lucide-react";

export default function WorkerRouteSummary({
  routes = [],
  selectedRoute,
  onSelectRoute,
  completedStops = 0,
  totalStops = 0,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const pct =
    totalStops > 0 ? Math.min(100, Math.round((completedStops / totalStops) * 100)) : 0;
  const offset = circumference - (pct / 100) * circumference;

  const routeNumber =
    selectedRoute?.route_number ??
    selectedRoute?.id ??
    selectedRoute?.route_id ??
    "1";
  const routeName =
    selectedRoute?.route_name ??
    selectedRoute?.name ??
    selectedRoute?.description ??
    "Assigned Route";

  return (
    <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl ring-1 ring-white/60 border border-white/40 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6 relative">
      <div className="flex items-center gap-4">
        <div className="w-13 h-13 rounded-2xl bg-emerald-100/90 flex items-center justify-center shrink-0 border border-emerald-200">
          <Truck className="w-6 h-6 text-emerald-700" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Custom Modern Dropdown Selector */}
            {routes.length > 1 ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 bg-emerald-50/90 hover:bg-emerald-100/90 text-[#0B3D2E] font-bold text-base sm:text-lg px-3.5 py-1.5 rounded-2xl border border-emerald-200 shadow-xs transition-all active:scale-[0.98]"
                >
                  <RouteIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Route #{routeNumber} {routeName ? `— ${routeName}` : ""}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-emerald-700 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Options Menu */}
                {dropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 border border-slate-100 p-1.5 z-50 animate-scaleIn">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Switch Assigned Route
                    </div>

                    <div className="space-y-1 max-h-60 overflow-y-auto no-scrollbar">
                      {routes.map((r) => {
                        const isSelected = String(r.id) === String(selectedRoute?.id);
                        const rNum = r.route_number || r.id;
                        const rName = r.route_name || r.name || "Assigned Route";

                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              onSelectRoute(r);
                              setDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                              isSelected
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-900"
                            }`}
                          >
                            <div className="truncate pr-2">
                              <p className="leading-tight truncate">
                                Route #{rNum} — {rName}
                              </p>
                              <p
                                className={`text-[10px] font-normal truncate mt-0.5 ${
                                  isSelected ? "text-emerald-100" : "text-gray-400"
                                }`}
                              >
                                {r.description || "Collection Path"}
                              </p>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-white shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <h1 className="text-xl font-bold text-[#0B3D2E]">
                Route #{routeNumber} — {routeName}
              </h1>
            )}

            {/* Shift Pill */}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {selectedRoute?.status || "Active Shift"}
            </span>
          </div>

          <p className="text-xs text-gray-500 font-medium">
            {selectedRoute?.description || "Daily municipal waste collection cycle"}
          </p>
        </div>
      </div>

      {/* Progress Chart Metric */}
      <div className="flex items-center gap-4 bg-emerald-50/70 border border-emerald-100/90 px-5 py-3 rounded-2xl shrink-0">
        <div className="relative w-16 h-16 shrink-0">
          <svg width="64" height="64" viewBox="0 0 80 80" className="-rotate-90">
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="8"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="#0DBF78"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-emerald-900 text-xs font-bold">{pct}%</span>
          </div>
        </div>
        <div className="text-left">
          <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
            Progress
          </p>
          <p className="text-sm font-bold text-[#0B3D2E] leading-tight">
            {completedStops} of {totalStops} Done
          </p>
        </div>
      </div>
    </div>
  );
}