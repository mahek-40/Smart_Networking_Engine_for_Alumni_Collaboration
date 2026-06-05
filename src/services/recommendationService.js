import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';
import { transformRecommendation } from '../utils/transformers';

export const recommendationService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.industry && filters.industry !== 'all' && filters.industry !== 'All') {
      params.append('industry', filters.industry);
    }
    if (filters.minScore) {
      params.append('min_score', filters.minScore);
    }
    params.append('page', filters.page || 1);
    params.append('page_size', filters.page_size || 50);
    
    const queryString = params.toString();
    const endpoint = `${API_ENDPOINTS.RECOMMENDATIONS_SIMILAR}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(endpoint);
    const items = response.data || [];
    
    // Transform backend format to frontend format
    return items.map(transformRecommendation);
  },
  
  getById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.PROFILE_BY_ID(id));
    return response.data;
  },
  
  connect: async (_userId) => {
    return { success: true, message: 'Connection request sent!' };
  },
  
  getAllUsers: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.PROFILE_SEARCH}?page=1&page_size=100`);
    return response.data || [];
  },
};

export default recommendationService;
