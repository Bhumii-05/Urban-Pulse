import api from './axios';

export const suggestionService = {
  // GET /api/v1/suggestions/ - Fetch all citizen suggestions
  getAllSuggestions: async () => {
    const response = await api.get('/admin/suggestions/');
    return response.data;
  },

  // GET /api/v1/suggestions/{suggestion_id}
  getSuggestionById: async (suggestionId) => {
    const response = await api.get(`/admin/suggestions/${suggestionId}`);
    return response.data;
  },

  // PATCH /api/v1/suggestions/{suggestion_id}/status - Approve / Reject
  updateSuggestionStatus: async (suggestionId, status) => {
    const response = await api.patch(`/admin/suggestions/${suggestionId}/status`, { status });
    return response.data;
  },

  // POST /api/v1/collection-points - Convert an approved suggestion to an official point
  createCollectionPointFromSuggestion: async (pointData) => {
    const response = await api.post('/collection-points', pointData);
    return response.data;
  },
};