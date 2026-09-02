import api from './axios';

export const analyticsService = {
  // GET /api/v1/analytics/overview - Fetch high-level counts
  getOverview: async () => {
    const response = await api.get('/analytics/overview');
    return response.data;
  },

  // GET /api/v1/analytics/workers
  getWorkersAnalytics: async () => {
    const response = await api.get('/analytics/workers');
    return response.data;
  },

  // GET /api/v1/analytics/concerns/status
  getConcernStatusAnalytics: async () => {
    const response = await api.get('/analytics/concerns/status');
    return response.data;
  },

  // GET /api/v1/analytics/routes/status
  getRouteStatusAnalytics: async () => {
    const response = await api.get('/analytics/routes/status');
    return response.data;
  },
};