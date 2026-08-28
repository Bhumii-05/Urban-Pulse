import api from './axios';

export const profileService = {
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch('/profile', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.patch('/profile/password', data);
    return response.data;
  },
};