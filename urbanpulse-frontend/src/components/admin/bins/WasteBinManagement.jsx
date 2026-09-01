import React, { useState, useEffect } from "react";
import {
  Trash2,
  Plus,
  RefreshCw,
  Power,
  Edit2,
  MapPin,
  X,
  Gauge,
  Search,
} from "lucide-react";
import binService from "../../../api/bin.service";
import { Modal, Field } from "../../common/CommonUI";

export default function WasteBinManagement({ fireToast }) {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBinId, setSelectedBinId] = useState(null);
  const [formData, setFormData] = useState({
    bin_code: "",
    latitude: "",
    longitude: "",
    capacity: 100,
    fill_level: 0,
  });

  const fetchBins = async () => {
    setLoading(true);
    try {
      const data = await binService.getAllBins();
      setBins(Array.isArray(data) ? data : []);
    } catch (err) {
      if (fireToast) fireToast("Failed to load waste bins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBins();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "bin_code" ? value : parseFloat(value) || value,
    }));
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setSelectedBinId(null);
    setFormData({
      bin_code: `BIN-${Math.floor(1000 + Math.random() * 9000)}`,
      latitude: "",
      longitude: "",
      capacity: 100,
      fill_level: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (bin) => {
    setIsEditing(true);
    setSelectedBinId(bin.id);
    setFormData({
      bin_code: bin.bin_code,
      latitude: bin.latitude,
      longitude: bin.longitude,
      capacity: bin.capacity,
      fill_level: bin.fill_level || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await binService.updateBin(selectedBinId, {
          bin_code: formData.bin_code,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          capacity: parseInt(formData.capacity, 10),
        });
        if (fireToast) fireToast(`Bin ${formData.bin_code} updated`);
      } else {
        await binService.createBin({
          bin_code: formData.bin_code,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          capacity: parseInt(formData.capacity, 10),
          fill_level: parseFloat(formData.fill_level || 0),
        });
        if (fireToast) fireToast(`New public bin registered`);
      }
      setIsModalOpen(false);
      fetchBins();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Error saving bin configuration";
      if (fireToast) fireToast(typeof errorMsg === "string" ? errorMsg : "Error saving bin");
    }
  };

  const handleToggleStatus = async (bin) => {
    try {
      if (bin.status === "active") {
        await binService.deactivateBin(bin.id);
        if (fireToast) fireToast(`Bin ${bin.bin_code} deactivated`);
      } else {
        await binService.activateBin(bin.id);
        if (fireToast) fireToast(`Bin ${bin.bin_code} activated`);
      }
      fetchBins();
    } catch (err) {
      if (fireToast) fireToast("Failed to update bin status");
    }
  };

  const handleQuickFillUpdate = async (binId, currentCapacity) => {
    const newLevel = prompt(`Enter new fill level (0 - ${currentCapacity} L):`);
    if (newLevel === null) return;

    const parsedLevel = parseFloat(newLevel);
    if (isNaN(parsedLevel) || parsedLevel < 0 || parsedLevel > currentCapacity) {
      alert("Please enter a valid fill level within capacity bounds.");
      return;
    }

    try {
      await binService.updateFillLevel(binId, parsedLevel);
      if (fireToast) fireToast(`Fill level updated`);
      fetchBins();
    } catch (err) {
      if (fireToast) fireToast("Failed to update fill level");
    }
  };

  const filteredBins = bins.filter((b) =>
    (b.bin_code || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl ring-1 ring-white/60 border border-white/40 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0B3D2E]">
              Waste Bin Management
            </h1>
            <p className="text-sm text-gray-500">
              Monitor fill levels, configure geolocation coordinates, and manage active municipal bins.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBins}
            className="p-2.5 border border-gray-200 bg-white rounded-xl hover:bg-gray-50 transition text-gray-600"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-900/10 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Public Bin
          </button>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="bg-teal-50/60 border border-teal-100 rounded-2xl p-4 mb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Bin Code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2 text-gray-600">
            <span>Total:</span>
            <strong className="text-gray-800 font-bold">{bins.length}</strong>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center gap-2 text-red-600 font-medium">
            <span>Critical (&gt;85%):</span>
            <strong className="font-bold">
              {bins.filter((b) => (b.fill_level / b.capacity) >= 0.85).length}
            </strong>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2 text-emerald-700 font-medium">
            <span>Active:</span>
            <strong className="font-bold">
              {bins.filter((b) => b.status === "active").length}
            </strong>
          </div>
        </div>
      </div>

      {/* Bins Table View */}
      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Loading waste bins...</div>
      ) : filteredBins.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-sm">No bins found matching criteria.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="py-3 px-5 text-left font-semibold">Bin Code</th>
                  <th className="py-3 px-5 text-left font-semibold">Coordinates (Lat, Lng)</th>
                  <th className="py-3 px-5 text-left font-semibold">Capacity Status</th>
                  <th className="py-3 px-5 text-left font-semibold">Operational Status</th>
                  <th className="py-3 px-5 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBins.map((bin) => {
                  const fillPercent = Math.round((bin.fill_level / bin.capacity) * 100);
                  return (
                    <tr key={bin.id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-gray-800">
                        {bin.bin_code}
                      </td>
                      <td className="py-3.5 px-5 text-gray-500 font-mono text-xs">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {Number(bin.latitude).toFixed(4)}, {Number(bin.longitude).toFixed(4)}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="w-44">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700">
                              {bin.fill_level} / {bin.capacity} L
                            </span>
                            <span className="text-gray-400">{fillPercent}%</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                fillPercent >= 85
                                  ? "bg-red-500"
                                  : fillPercent >= 50
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(fillPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            bin.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {bin.status || "active"}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleQuickFillUpdate(bin.id, bin.capacity)}
                            className="p-1.5 text-gray-500 hover:text-teal-700 hover:bg-teal-50 border border-gray-200 rounded-lg transition"
                            title="Simulate / Update Fill Level"
                          >
                            <Gauge className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(bin)}
                            className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 border border-gray-200 rounded-lg transition"
                            title="Edit Bin"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(bin)}
                            className={`p-1.5 rounded-lg border transition ${
                              bin.status === "active"
                                ? "text-amber-600 hover:bg-amber-50 border-amber-200"
                                : "text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                            }`}
                            title={bin.status === "active" ? "Deactivate Bin" : "Activate Bin"}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#0B3D2E]">
            {isEditing ? "Update Waste Bin" : "Register New Waste Bin"}
          </h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 rounded-full p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Bin Identifier / Code">
            <input
              type="text"
              name="bin_code"
              required
              value={formData.bin_code}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude">
              <input
                type="number"
                step="any"
                name="latitude"
                required
                placeholder="e.g. 30.3165"
                value={formData.latitude}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 font-mono"
              />
            </Field>
            <Field label="Longitude">
              <input
                type="number"
                step="any"
                name="longitude"
                required
                placeholder="e.g. 78.0322"
                value={formData.longitude}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 font-mono"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Capacity (Liters)">
              <input
                type="number"
                name="capacity"
                required
                min="1"
                value={formData.capacity}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
            </Field>
            {!isEditing && (
              <Field label="Initial Fill (L)">
                <input
                  type="number"
                  name="fill_level"
                  min="0"
                  value={formData.fill_level}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </Field>
            )}
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
            >
              {isEditing ? "Save Changes" : "Create Bin"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}