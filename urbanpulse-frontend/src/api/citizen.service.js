import api from './axios';

export const citizenService = {
  // Fetch logged-in citizen's concerns
  getOwnConcerns: async () => {
    const response = await api.get('/citizen/concerns');
    return response.data;
  },

  // View specific concern details
  getConcernById: async (id) => {
    const response = await api.get(`/citizen/concerns/${id}`);
    return response.data;
  },

  // Delete a pending concern
  deleteConcern: async (id) => {
    const response = await api.delete(`/citizen/concerns/${id}`);
    return response.data;
  },

  // Fetch citizen dashboard stats
  getCitizenDashboard: async () => {
    const response = await api.get('/dashboard/citizen');
    return response.data;
  },

  // Submit a location suggestion
  submitSuggestion: async (suggestionData) => {
    const response = await api.post('/citizen/suggestions', suggestionData);
    return response.data;
  },
};