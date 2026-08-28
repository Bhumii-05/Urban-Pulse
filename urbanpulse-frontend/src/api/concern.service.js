import api from './axios';


export const concernService = {
  // --- Citizen Methods ---
  createConcern: async ({ category, description, location, priority }) => {
    const response = await api.post('/concerns/', {
      category,
      description,
      location,
      priority,
    });
    return response.data;
  },

  uploadConcernImage: async (concernId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/concerns/${concernId}/images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // --- Admin Dashboard Methods ---
  getAllConcerns: async () => {
    const response = await api.get('/concerns/');
    return response.data;
  },

  getConcernImages: async (concernId) => {
    const response = await api.get(`/concerns/${concernId}/images`);
    return response.data;
  },

  updateConcernStatus: async (concernId, status) => {
    const response = await api.patch(`/concerns/${concernId}/status`, { status });
    return response.data;
  },

  deleteConcern: async (concernId) => {
    const response = await api.delete(`/concerns/${concernId}`);
    return response.data;
  },
};