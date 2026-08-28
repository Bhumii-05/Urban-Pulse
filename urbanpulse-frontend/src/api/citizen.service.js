import api from './axios';

export const citizenService = {
  /**
   * Fetch Citizen Stats & Counts
   * HTTP GET /api/v1/dashboard/citizen
   */
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/citizen');
    return response.data;
  },

  /**
   * Fetch Citizen's Complaints/Concerns List
   * HTTP GET /api/v1/concerns/
   */
  getConcerns: async () => {
    const response = await api.get('/concerns/');
    return response.data;
  },

  /**
   * Delete a Pending Concern
   * HTTP DELETE /api/v1/concerns/{concern_id}
   */
  deleteConcern: async (concernId) => {
    const response = await api.delete(`/concerns/${concernId}`);
    return response.data;
  },

  /**
   * Submit a New Suggestion
   * HTTP POST /api/v1/citizen/suggestions
   */
  createSuggestion: async (data) => {
    const response = await api.post('/citizen/suggestions', data);
    return response.data;
  },

  /**
   * Fetch Suggestion History
   * HTTP GET /api/v1/citizen/suggestions
   */
  getSuggestions: async () => {
    const response = await api.get('/citizen/suggestions');
    return response.data;
  },
};