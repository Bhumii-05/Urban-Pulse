import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = { lat: 22.5726, lng: 88.3639 };

const SUGGESTION_TYPES = [
  { value: "waste_pickup", label: "Waste Pickup" },
  { value: "add_bin", label: "Add Bin" },
  { value: "general", label: "General" },
  { value: "other", label: "Other" },
];

const pinIcon = L.divIcon({
  className: "urbanpulse-pin",
  html: `
    <svg width="34" height="42" viewBox="0 0 34 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 12.4 17 25 17 25s17-12.6 17-25C34 7.6 26.4 0 17 0z" fill="#16A34A"/>
      <circle cx="17" cy="17" r="7" fill="white"/>
    </svg>
  `,
  iconSize: [34, 42],
  iconAnchor: [17, 42],
  popupAnchor: [0, -38],
});

function MapReadyFixer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function LocationPicker({ position, onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return (
    <Marker
      position={position}
      icon={pinIcon}
      draggable
      eventHandlers={{
        dragend: (e) => onSelect(e.target.getLatLng()),
      }}
    />
  );
}

export default function SuggestionDrawer({
  open,
  onClose,
  onSubmit,
  submitting,
  formErrors,
}) {
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_CENTER);
  const [form, setForm] = useState({
    title: "",
    description: "",
    suggestion_type: "waste_pickup",
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      suggestion_type: form.suggestion_type,
      latitude: selectedLocation?.lat != null ? Number(selectedLocation.lat) : null,
      longitude: selectedLocation?.lng != null ? Number(selectedLocation.lng) : null,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[900] bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            className="fixed right-0 top-0 z-[901] flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h3 className="text-lg font-bold text-slate-900">Suggest New Waste Pick Point</h3>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
              <label className="mb-2 text-sm font-medium text-slate-700">Select Location</label>
              <div className="h-64 w-full shrink-0 overflow-hidden rounded-xl border border-slate-200">
                <MapContainer
                  center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
                  zoom={13}
                  scrollWheelZoom
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapReadyFixer />
                  <LocationPicker
                    position={[selectedLocation.lat, selectedLocation.lng]}
                    onSelect={(latlng) => setSelectedLocation({ lat: latlng.lat, lng: latlng.lng })}
                  />
                </MapContainer>
              </div>
              <p className="mt-2 text-xs text-slate-400">Tap the map or drag the pin to choose a spot.</p>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-medium uppercase text-slate-400">Latitude</p>
                  <p className="text-sm font-medium text-slate-700">{selectedLocation.lat.toFixed(6)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-medium uppercase text-slate-400">Longitude</p>
                  <p className="text-sm font-medium text-slate-700">{selectedLocation.lng.toFixed(6)}</p>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Suggestion Type</label>
                <select
                  value={form.suggestion_type}
                  onChange={(e) => setForm((p) => ({ ...p, suggestion_type: e.target.value }))}
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    formErrors.suggestion_type ? "border-red-300" : "border-slate-200"
                  }`}
                >
                  {SUGGESTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {formErrors.suggestion_type && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.suggestion_type}</p>
                )}
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Suggestion Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Need a bin near the park entrance"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    formErrors.title ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {formErrors.title && <p className="mt-1 text-xs text-red-600">{formErrors.title}</p>}
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Describe why a waste collection point/bin is needed here..."
                  className={`w-full resize-none rounded-lg border px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    formErrors.description ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.description}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#005B4F] to-[#00473e] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? "Submitting…" : "Submit Suggestion"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}