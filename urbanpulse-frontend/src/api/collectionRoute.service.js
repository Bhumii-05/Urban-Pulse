import api from './axios';

export const collectionRouteService = {
  getAllRoutes: async () => {
    const response = await api.get('/collection-routes');
    return response.data;
  },

  getRouteById: async (routeId) => {
    const response = await api.get(`/collection-routes/${routeId}`);
    return response.data;
  },

  createRoute: async (routeData) => {
    const payload = {
      route_name: routeData.name || routeData.route_name,
      route_date: routeData.route_date || new Date().toISOString(),
      worker_id: parseInt(routeData.worker_id, 10),
    };
    const response = await api.post('/collection-routes', payload);
    return response.data;
  },

  updateRoute: async (routeId, routeData) => {
    const payload = {};
    if (routeData.route_name || routeData.name) {
      payload.route_name = routeData.route_name || routeData.name;
    }
    if (routeData.route_date) {
      payload.route_date = routeData.route_date;
    }
    const response = await api.patch(`/collection-routes/${routeId}`, payload);
    return response.data;
  },

  updateRouteStatus: async (routeId, status) => {
    const response = await api.patch(`/collection-routes/${routeId}/status`, { status });
    return response.data;
  },

  deleteRoute: async (routeId) => {
    const response = await api.delete(`/collection-routes/${routeId}`);
    return response.data;
  },
};

export default collectionRouteService;