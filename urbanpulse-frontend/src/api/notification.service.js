import api from './axios';

export const notificationService = {
  // GET /api/v1/notifications
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // PATCH /api/v1/notifications/read-all
  markAllRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  // PATCH /api/v1/notifications/{notification_id}/read
  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },
};