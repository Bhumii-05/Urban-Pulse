import api from './axios';
import { concernService } from './concern.service';

export const workerService = {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),

  getWorkerDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard/worker');
      return response.data;
    } catch (e) {
      return null;
    }
  },

  getAllAssignedRoutes: async () => {
    const response = await api.get('/collection-routes');
    const routes = Array.isArray(response.data)
      ? response.data
      : response.data?.routes || response.data?.data || [];
    return routes;
  },

  getRouteStops: async (routeId) => {
    const response = await api.get(`/collection-points/route/${routeId}`);
    return Array.isArray(response.data)
      ? response.data
      : response.data?.points || response.data?.data || [];
  },

  markStopCollected: async (pointId) => {
    const response = await api.patch(`/collection-points/${pointId}/collect`);
    return response.data;
  },

  reportStopIssue: async ({ title, category = "missed_pickup", description, location, priority = "high" }) => {
    return await concernService.createConcern({
      title,
      category,
      description,
      location,
      priority,
    });
  },
};

export default workerService;