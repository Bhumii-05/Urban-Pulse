import api from './axios';

export const binService = {
  // Get all waste bins
  getAllBins: async () => {
    const response = await api.get('/waste-bins');
    return response.data;
  },

  // Get a single waste bin by UUID
  getBinById: async (binId) => {
    const response = await api.get(`/waste-bins/${binId}`);
    return response.data;
  },

  // Create a new public waste bin
  createBin: async (binData) => {
    const payload = {
      bin_code: String(binData.bin_code).trim(),
      latitude: parseFloat(binData.latitude),
      longitude: parseFloat(binData.longitude),
      capacity: parseInt(binData.capacity, 10),
      fill_level: binData.fill_level != null && binData.fill_level !== '' 
        ? parseFloat(binData.fill_level) 
        : 0,
    };

    const response = await api.post('/waste-bins', payload);
    return response.data;
  },

  // Update bin metadata (bin code, coordinates, capacity)
  updateBin: async (binId, binData) => {
    const payload = {};

    if (binData.bin_code && String(binData.bin_code).trim()) {
      payload.bin_code = String(binData.bin_code).trim();
    }
    if (binData.latitude != null && binData.latitude !== '') {
      payload.latitude = parseFloat(binData.latitude);
    }
    if (binData.longitude != null && binData.longitude !== '') {
      payload.longitude = parseFloat(binData.longitude);
    }
    if (binData.capacity != null && binData.capacity !== '') {
      payload.capacity = parseInt(binData.capacity, 10);
    }

    const response = await api.patch(`/waste-bins/${binId}`, payload);
    return response.data;
  },

  // Update real-time or simulated fill level
  updateFillLevel: async (binId, fillLevel) => {
    const payload = {
      fill_level: parseFloat(fillLevel),
    };

    const response = await api.patch(`/waste-bins/${binId}/fill-level`, payload);
    return response.data;
  },

  // Activate bin
  activateBin: async (binId) => {
    const response = await api.patch(`/waste-bins/${binId}/activate`);
    return response.data;
  },

  // Deactivate bin
  deactivateBin: async (binId) => {
    const response = await api.patch(`/waste-bins/${binId}/deactivate`);
    return response.data;
  },
};

export default binService;