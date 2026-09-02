import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Pencil,
  Trash2,
  PlusCircle,
  AlertTriangle,
  MessageSquare,
  Navigation,
  UserCheck,
} from "lucide-react";
import { getCategoryLabel } from "../../../api/concernConfig";

/* ------------------------------------------------------------------ */
/* Leaflet Color Markers Setup                                       */
/* ------------------------------------------------------------------ */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const createColoredIcon = (colorUrl) =>
  new L.Icon({
    iconUrl: colorUrl,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const concernIcon = createColoredIcon(
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png"
);
const suggestionIcon = createColoredIcon(
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png"
);
const pendingPointIcon = createColoredIcon(
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png"
);
const completedPointIcon = createColoredIcon(
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
);
const draftPointIcon = createColoredIcon(
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"
);

/* ------------------------------------------------------------------ */
/* Coordinate Parser Helper                                           */
/* ------------------------------------------------------------------ */
export function parseCoordinates(loc) {
  if (!loc) return null;
  if (Array.isArray(loc) && loc.length >= 2) {
    const lat = Number(loc[0]);
    const lng = Number(loc[1]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  if (typeof loc === "object") {
    const lat = loc.latitude ?? loc.lat;
    const lng = loc.longitude ?? loc.lng;
    if (lat != null && lng != null) {
      const numLat = Number(lat);
      const numLng = Number(lng);
      if (!isNaN(numLat) && !isNaN(numLng)) return { lat: numLat, lng: numLng };
    }
  }
  if (typeof loc === "string") {
    const trimmed = loc.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        return parseCoordinates(JSON.parse(trimmed));
      } catch (e) {}
    }
    if (trimmed.includes(",")) {
      const parts = trimmed.split(",").map((v) => Number(v.trim()));
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { lat: parts[0], lng: parts[1] };
      }
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Map Controllers                                                    */
/* ------------------------------------------------------------------ */
function MapClickHandler({ isCreatingPoint, onMapClick }) {
  useMapEvents({
    click(e) {
      if (isCreatingPoint && onMapClick) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

function MapViewController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      const lat = Number(center[0]);
      const lng = Number(center[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        map.setView([lat, lng], map.getZoom(), { animate: true });
      }
    }
  }, [center, map]);
  return null;
}

/* ------------------------------------------------------------------ */
/* Main Interactive Map Component                                     */
/* ------------------------------------------------------------------ */
export default function InteractiveMap({
  mapCenter = [22.5726, 88.3639],
  isCreatingPoint = false,
  onMapClick,
  concerns = [],
  suggestions = [],
  routePoints = [],
  polylinePositions = [],
  newPointForm = {},
  onAddLocationToRoute,
  onAssignItem,
  onEditPoint,
  onDeletePoint,
}) {
  const safeConcerns = Array.isArray(concerns) ? concerns : [];
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
  const safeRoutePoints = Array.isArray(routePoints) ? routePoints : [];

  const draftLat = parseFloat(newPointForm?.latitude);
  const draftLng = parseFloat(newPointForm?.longitude);
  const hasValidDraft =
    !isNaN(draftLat) &&
    !isNaN(draftLng) &&
    draftLat >= -90 &&
    draftLat <= 90 &&
    draftLng >= -180 &&
    draftLng <= 180;

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Interactive GIS Route Map
          </h3>
          {isCreatingPoint && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 animate-pulse border border-emerald-200">
              Click map to plot stop
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[10px] flex-wrap font-medium text-gray-600">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
            Concern
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-purple-200" />
            Suggestion
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-200" />
            Pending Stop
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            Collected
          </span>
        </div>
      </div>

      {/* Leaflet Map Frame */}
      <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-sm isolate relative z-0">
        <div className="w-full h-[470px] rounded-xl overflow-hidden relative z-0">
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapViewController center={mapCenter} />
            <MapClickHandler
              isCreatingPoint={isCreatingPoint}
              onMapClick={onMapClick}
            />

            {/* 1. Orange Markers: Concerns */}
            {safeConcerns
              .filter((c) => String(c?.status || "").toLowerCase() !== "resolved")
              .map((c) => {
                const coords =
                  parseCoordinates(c?.location) ||
                  parseCoordinates({ lat: c?.latitude, lng: c?.longitude });
                if (!coords) return null;

                return (
                  <Marker
                    key={`concern-${c.id}`}
                    position={[coords.lat, coords.lng]}
                    icon={concernIcon}
                  >
                    <Popup className="custom-map-popup">
                      <div className="w-60 p-1 text-xs space-y-2">
                        <div className="flex items-center justify-between border-b border-orange-100 pb-1.5">
                          <span className="font-bold text-amber-600 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Concern #{c.id}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold uppercase">
                            {c.priority || "Medium"}
                          </span>
                        </div>

                        <p className="font-semibold text-gray-800 leading-tight">
                          {getCategoryLabel(c.category) || c.title || "Waste Concern"}
                        </p>

                        {c.description && (
                          <p className="text-[11px] text-gray-600 line-clamp-2">
                            {c.description}
                          </p>
                        )}

                        <p className="font-mono text-[10px] text-gray-400">
                          {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                        </p>

                        <div className="space-y-1.5 pt-1 border-t border-gray-100">
                          {onAddLocationToRoute && (
                            <button
                              type="button"
                              onClick={() =>
                                onAddLocationToRoute(
                                  getCategoryLabel(c.category) || `Concern #${c.id}`,
                                  coords
                                )
                              }
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                            >
                              <PlusCircle className="w-3.5 h-3.5" /> Add to Active Route
                            </button>
                          )}

                          {onAssignItem && (
                            <button
                              type="button"
                              onClick={() =>
                                onAssignItem({
                                  id: c.id,
                                  title: getCategoryLabel(c.category) || `Concern #${c.id}`,
                                  location: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
                                  type: "concern",
                                })
                              }
                              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-emerald-700" /> Dispatch Worker
                            </button>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

            {/* 2. Purple Markers: Suggestions */}
            {safeSuggestions
              .filter((s) => {
                const st = String(s?.status || "pending").toLowerCase();
                return st === "pending" || st === "reviewed";
              })
              .map((s) => {
                const coords = parseCoordinates({
                  lat: s?.latitude ?? s?.lat,
                  lng: s?.longitude ?? s?.lng,
                });
                if (!coords) return null;

                return (
                  <Marker
                    key={`suggestion-${s.id}`}
                    position={[coords.lat, coords.lng]}
                    icon={suggestionIcon}
                  >
                    <Popup className="custom-map-popup">
                      <div className="w-60 p-1 text-xs space-y-2">
                        <div className="flex items-center justify-between border-b border-purple-100 pb-1.5">
                          <span className="font-bold text-purple-700 flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" /> Citizen Suggestion
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold uppercase">
                            #{s.id}
                          </span>
                        </div>

                        <p className="font-semibold text-gray-800 leading-tight">
                          {s.title || "Bin Request"}
                        </p>

                        {s.description && (
                          <p className="text-[11px] text-gray-600 line-clamp-2">
                            {s.description}
                          </p>
                        )}

                        <p className="font-mono text-[10px] text-gray-400">
                          {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                        </p>

                        <div className="space-y-1.5 pt-1 border-t border-gray-100">
                          {onAddLocationToRoute && (
                            <button
                              type="button"
                              onClick={() =>
                                onAddLocationToRoute(
                                  s.title || `Suggestion #${s.id}`,
                                  coords
                                )
                              }
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                            >
                              <PlusCircle className="w-3.5 h-3.5" /> Add to Active Route
                            </button>
                          )}

                          {onAssignItem && (
                            <button
                              type="button"
                              onClick={() =>
                                onAssignItem({
                                  id: s.id,
                                  title: s.title || `Suggestion #${s.id}`,
                                  location: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
                                  type: "suggestion",
                                })
                              }
                              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-emerald-700" /> Dispatch Worker
                            </button>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

            {/* 3. Blue / Green Markers: Route Points */}
            {safeRoutePoints.map((p) => {
              const coords = parseCoordinates({
                lat: p?.latitude ?? p?.lat,
                lng: p?.longitude ?? p?.lng,
              });
              if (!coords) return null;

              const isDone =
                Boolean(p.is_collected) ||
                String(p.status || "").toLowerCase() === "collected";

              return (
                <Marker
                  key={`point-${p.id || p.sequence_order}`}
                  position={[coords.lat, coords.lng]}
                  icon={isDone ? completedPointIcon : pendingPointIcon}
                >
                  <Popup className="custom-map-popup">
                    <div className="w-56 p-1 text-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            isDone ? "text-emerald-700" : "text-blue-700"
                          }`}
                        >
                          <Navigation className="w-3.5 h-3.5" /> Stop #{p.id}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                          Seq #{p.sequence_order}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-500">Status:</span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                            isDone
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {isDone ? "Collected" : "Pending Pickup"}
                        </span>
                      </div>

                      {p.waste_bin_id && (
                        <p className="font-mono text-[10px] text-gray-500 truncate">
                          Bin ID: {p.waste_bin_id}
                        </p>
                      )}

                      <p className="font-mono text-[10px] text-gray-400">
                        {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                      </p>

                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-gray-100">
                        {onEditPoint && (
                          <button
                            type="button"
                            onClick={() => onEditPoint(p)}
                            className="flex-1 py-1.5 px-2 border border-blue-200 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                        )}

                        {onDeletePoint && (
                          <button
                            type="button"
                            onClick={() => onDeletePoint(p)}
                            className="flex-1 py-1.5 px-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* 4. Red Draft Marker */}
            {hasValidDraft && (
              <Marker position={[draftLat, draftLng]} icon={draftPointIcon}>
                <Popup>
                  <div className="text-xs space-y-1 p-0.5">
                    <p className="font-bold text-red-600">Plotted Point Target</p>
                    <p className="font-mono text-[10px] text-gray-500">
                      {draftLat.toFixed(5)}, {draftLng.toFixed(5)}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Click "Save Collection Point" to add this stop.
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* 5. Polyline */}
            {Array.isArray(polylinePositions) && polylinePositions.length > 1 && (
              <Polyline
                positions={polylinePositions}
                color="#2563eb"
                weight={3.5}
                dashArray="6, 8"
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}