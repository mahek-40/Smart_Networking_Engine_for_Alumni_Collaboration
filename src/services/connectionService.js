import apiClient from '../utils/apiClient';

export const connectionService = {
  sendRequest: async (targetUserId) => {
    const response = await apiClient.post(`/api/connections/request/${targetUserId}`);
    return response;
  },
  
  acceptRequest: async (connectionId) => {
    const response = await apiClient.put(`/api/connections/accept/${connectionId}`);
    return response;
  },
  
  rejectRequest: async (connectionId) => {
    const response = await apiClient.put(`/api/connections/reject/${connectionId}`);
    return response;
  },
  
  getMyConnections: async (page = 1, pageSize = 50) => {
    const response = await apiClient.get(`/api/connections/my-connections?page=${page}&page_size=${pageSize}`);
    return response.data || [];
  },
  
  getPending: async () => {
    const response = await apiClient.get('/api/connections/pending');
    return response.data || { received: [], sent: [] };
  },
  
  getStatus: async (targetUserId) => {
    const response = await apiClient.get(`/api/connections/status/${targetUserId}`);
    return response.data || { status: 'none' };
  },
};

export default connectionService;
