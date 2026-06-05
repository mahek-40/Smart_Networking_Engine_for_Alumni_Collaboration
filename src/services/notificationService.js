import apiClient from '../utils/apiClient';

export const notificationService = {
  getAll: async (page = 1, pageSize = 50, unreadOnly = false) => {
    const response = await apiClient.get(
      `/api/notifications?page=${page}&page_size=${pageSize}&unread_only=${unreadOnly}`
    );
    return response.data || [];
  },
  
  markAsRead: async (notificationId) => {
    const response = await apiClient.put(`/api/notifications/mark-read/${notificationId}`);
    return response;
  },
  
  markAllAsRead: async () => {
    const response = await apiClient.put('/api/notifications/mark-all-read');
    return response;
  },
  
  deleteNotification: async (notificationId) => {
    const response = await apiClient.delete(`/api/notifications/${notificationId}`);
    return response;
  },
  
  getUnreadCount: async () => {
    const response = await apiClient.get('/api/notifications/unread-count');
    return response.data?.unread_count || 0;
  },
};

export default notificationService;
