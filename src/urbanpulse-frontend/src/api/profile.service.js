/**
 * Project Name: UrbanPulse
 * Group Name: Vision Crafters
 * Author(s): Ashish Pant
 * Date of Last Modification: 13 September 2026
 * Brief Description: Handles API requests for user profile operations.
 */

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