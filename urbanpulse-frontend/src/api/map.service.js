import api from './axios';

export const mapService = {
  // GET /api/v1/maps/nearby-bins
  getNearbyBins: async (latitude, longitude, radius = 5000) => {
    const response = await api.get('/maps/nearby-bins', {
      params: { latitude, longitude, radius },
    });
    return response.data;
  },

  // GET /api/v1/maps/nearby-concerns
  getNearbyConcerns: async (latitude, longitude, radius = 5000) => {
    const response = await api.get('/maps/nearby-concerns', {
      params: { latitude, longitude, radius },
    });
    return response.data;
  },

  // GET /api/v1/maps/nearby-collection-points
  getNearbyCollectionPoints: async (latitude, longitude, radius = 5000) => {
    const response = await api.get('/maps/nearby-collection-points', {
      params: { latitude, longitude, radius },
    });
    return response.data;
  },
};