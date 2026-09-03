import api from './axios';

export const analyticsService = {
  // Public Landing Page Impact
  getPublicImpact: async () => {
    const response = await api.get('/analytics/public-impact');
    return response.data;
  },

  getOverview: async () => {
    const response = await api.get('/analytics/overview');
    return response.data;
  },

  getWorkersAnalytics: async () => {
    const response = await api.get('/analytics/workers');
    return response.data;
  },

  getConcernStatusAnalytics: async () => {
    const response = await api.get('/analytics/concerns/status');
    return response.data;
  },

  getRouteStatusAnalytics: async () => {
    const response = await api.get('/analytics/routes/status');
    return response.data;
  },
};