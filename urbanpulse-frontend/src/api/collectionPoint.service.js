import api from './axios';

export const collectionPointService = {
  getAllPoints: async () => {
    const response = await api.get('/collection-points');
    return response.data;
  },

  getPointsByRoute: async (routeId) => {
    const response = await api.get(`/collection-points/route/${routeId}`);
    return response.data;
  },

  getPointById: async (pointId) => {
    const response = await api.get(`/collection-points/${pointId}`);
    return response.data;
  },

  createPoint: async (pointData) => {
    const payload = {
      route_id: Number(pointData.route_id),
      latitude: Number(pointData.latitude),
      longitude: Number(pointData.longitude),
      sequence_order: Number(pointData.sequence_order || 1),
    };

    if (pointData.waste_bin_id && String(pointData.waste_bin_id).trim()) {
      payload.waste_bin_id = String(pointData.waste_bin_id).trim();
    }

    const response = await api.post('/collection-points', payload);
    return response.data;
  },

  updatePoint: async (pointId, pointData) => {
    const payload = {};
    if (pointData.latitude != null && pointData.latitude !== "") {
      payload.latitude = parseFloat(pointData.latitude);
    }
    if (pointData.longitude != null && pointData.longitude !== "") {
      payload.longitude = parseFloat(pointData.longitude);
    }
    if (pointData.sequence_order != null && pointData.sequence_order !== "") {
      payload.sequence_order = parseInt(pointData.sequence_order, 10);
    }
    if (pointData.waste_bin_id && String(pointData.waste_bin_id).trim()) {
      payload.waste_bin_id = String(pointData.waste_bin_id).trim();
    }
    const response = await api.patch(`/collection-points/${pointId}`, payload);
    return response.data;
  },

  deletePoint: async (pointId) => {
    const response = await api.delete(`/collection-points/${pointId}`);
    return response.data;
  },

  markPointCollected: async (pointId) => {
    const response = await api.patch(`/collection-points/${pointId}/collect`);
    return response.data;
  },
};

export default collectionPointService;