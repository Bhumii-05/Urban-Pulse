import api from './axios';

export const routeService = {
  // Collection Routes
  getAllRoutes: async () => {
    const response = await api.get('/collection-routes');
    return response.data;
  },
  getRouteById: async (routeId) => {
    const response = await api.get(`/collection-routes/${routeId}`);
    return response.data;
  },
  updateRouteStatus: async (routeId, status) => {
    const response = await api.patch(`/collection-routes/${routeId}/status`, { status });
    return response.data;
  },

  // Collection Points
  getAllPoints: async () => {
    const response = await api.get('/collection-points');
    return response.data;
  },
  getPointsByRoute: async (routeId) => {
    const response = await api.get(`/collection-points/route/${routeId}`);
    return response.data;
  },
  markPointCollected: async (pointId) => {
    const response = await api.patch(`/collection-points/${pointId}/collect`);
    return response.data;
  },
};
