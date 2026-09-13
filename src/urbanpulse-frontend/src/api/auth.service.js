/**
 * Project Name: UrbanPulse
 * Group Name: Vision Crafters
 * Author(s): Ashish Pant
 * Date of Last Modification: 13 September 2026
 * Brief Description: Handles authentication, registration, login, and token management API requests.
 */

import api from './axios'

export const authService = {
  // Sign up API call
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Login API call
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // Fetch current user details & role
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Logout helper
  logout: () => {
    localStorage.removeItem('access_token')
    window.location.href = '/login'
  },

  //forgot password
  forgotPassword: async (identifier) => {
  const response = await api.post("/auth/forgot-password", { identifier });
  return response.data;
},

//reset-password
resetPassword: async ({ token, new_password }) => {
  const response = await api.post("/auth/reset-password", {
    token,
    new_password,
  });
  return response.data;
},
}