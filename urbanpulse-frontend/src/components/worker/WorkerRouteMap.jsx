import React, { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Map as MapIcon } from "lucide-react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MARKER_COLORS = {
  collected: "#059669",
  pending: "#F59E0B",
  issue: "#DC2626",
};

function createNumberedIcon(number, color) {
  return L.divIcon({
    className: "urbanpulse-marker",
    html: `
      <div style="
        width:30px;height:30px;
        border-radius:50% 50% 50% 0;
        background:${color};
        border:2px solid #ffffff;
        box-shadow:0 2px 6px rgba(0,0,0,0.35);
        transform:rotate(-45deg);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="
          transform:rotate(45deg);
          color:#ffffff;font-weight:700;font-size:12px;font-family:sans-serif;
        ">${number}</span>
      </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });
}

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (!positions || positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 14);
    } else {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
}

export default function WorkerRouteMap({ stops = [] }) {
  const stopsWithCoords = useMemo(
    () => stops.filter((s) => s.coords && s.coords.lat && s.coords.lng),
    [stops]
  );
  const positions = useMemo(
    () => stopsWithCoords.map((s) => [s.coords.lat, s.coords.lng]),
    [stopsWithCoords]
  );

  if (stopsWithCoords.length === 0) {
    return (
      <div className="w-full h-[420px] rounded-3xl bg-white border border-slate-100 flex flex-col items-center justify-center text-center px-6 shadow-sm">
        <MapIcon className="w-10 h-10 text-gray-300 mb-2" />
        <p className="text-gray-700 font-semibold text-sm">
          Location coordinates unavailable for this route.
        </p>
        <p className="text-gray-400 text-xs mt-0.5">
          Stops will appear once geographic points are assigned.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[440px] rounded-3xl overflow-hidden border border-slate-100 shadow-xl isolate relative z-0">
      <MapContainer
        center={positions[0]}
        zoom={13}
        scrollWheelZoom
        style={{ width: "100%", height: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds positions={positions} />
        <Polyline
          positions={positions}
          pathOptions={{ color: "#059669", weight: 3.5, dashArray: "6, 8" }}
        />
        {stopsWithCoords.map((s) => (
          <Marker
            key={s.id ?? s.row}
            position={[s.coords.lat, s.coords.lng]}
            icon={createNumberedIcon(s.row, MARKER_COLORS[s.status] || MARKER_COLORS.pending)}
          >
            <Popup>
              <div className="text-xs space-y-1 p-0.5">
                <p className="font-bold text-gray-800">
                  Stop #{s.row} — {s.location}
                </p>
                <p className="text-gray-600 capitalize">
                  Status: <strong>{s.status === "issue" ? "Issue reported" : s.status}</strong>
                </p>
                {s.status === "issue" && s.issueReason && (
                  <p className="text-red-600">Reason: {s.issueReason}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}