import api from './axios';

export const workerService = {
  // Expose underlying HTTP methods in case components invoke them directly
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),

  // High-level API helper functions
  getAssignedRoute: async () => {
    const response = await api.get('/collection-routes');
    const routes = Array.isArray(response.data) ? response.data : response.data.routes || [];
    return routes.length > 0 ? routes[0] : null;
  },

  getRouteStops: async (routeId) => {
    const response = await api.get(`/collection-points/route/${routeId}`);
    return Array.isArray(response.data) ? response.data : response.data.points || [];
  },

  markStopCollected: async (pointId) => {
    const response = await api.patch(`/collection-points/${pointId}/collect`);
    return response.data;
  },

  reportStopIssue: async ({ category, description, location, priority }) => {
    const response = await api.post('/concerns/', {
      category,
      description,
      location,
      priority,
    });
    return response.data;
  },
};

export default workerService;