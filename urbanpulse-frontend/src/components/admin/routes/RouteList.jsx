import React from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function RouteList({
  routes,
  selectedRoute,
  onSelectRoute,
  onOpenCreateRoute,
  onOpenEditRoute,
  onOpenDeleteRoute,
  onToggleRouteStatus,
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Available Routes ({routes.length})
        </h3>
        <button
          onClick={onOpenCreateRoute}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> New Route
        </button>
      </div>

      {routes.map((route) => {
        const isSelected = selectedRoute?.id === route.id;
        const isActive = route.status?.toLowerCase() === "active";

        return (
          <div
            key={route.id}
            onClick={() => onSelectRoute(route)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              isSelected
                ? "bg-blue-50/90 border-blue-500 shadow-sm"
                : "bg-white border-gray-100 hover:border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm text-[#0B3D2E]">
                {route.route_name || route.name || `Route #${route.id}`}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEditRoute(route);
                  }}
                  className="p-1 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                  title="Edit Route Name/Date"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDeleteRoute(route);
                  }}
                  className="p-1 text-red-400 hover:text-red-700 hover:bg-red-50 rounded"
                  title="Delete Route"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRouteStatus(route.id, route.status);
                  }}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition hover:opacity-80 ${
                    isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {route.status || "Active"}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {route.description || "City waste pickup path"}
            </p>
          </div>
        );
      })}

      {routes.length === 0 && (
        <div className="p-6 text-center border border-dashed rounded-2xl bg-gray-50/50">
          <p className="text-xs text-gray-500 mb-3">No collection routes found.</p>
          <button
            onClick={onOpenCreateRoute}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
          >
            + Create First Route
          </button>
        </div>
      )}
    </div>
  );
}