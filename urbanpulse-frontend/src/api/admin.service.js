import api from './axios';

export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },
  updateUser: async (id, userData) => {
    const response = await api.patch(`/admin/users/${id}`, userData);
    return response.data;
  },
 toggleUserStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/users/${id}/status`, {
      is_active: Boolean(isActive),
    });
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
};