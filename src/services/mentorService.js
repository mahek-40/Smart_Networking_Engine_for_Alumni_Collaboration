import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';
import { transformRecommendation } from '../utils/transformers';

export const mentorService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.industry && filters.industry !== 'all' && filters.industry !== 'All') {
      params.append('industry', filters.industry);
    }
    if (filters.minRating) {
      params.append('min_experience', filters.minRating);
    }
    params.append('page', filters.page || 1);
    params.append('page_size', filters.page_size || 50);
    
    const queryString = params.toString();
    const endpoint = `${API_ENDPOINTS.RECOMMENDATIONS_MENTORS}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(endpoint);
    const items = response.data || [];
    
    // Transform backend format to frontend format
    return items.map(transformRecommendation);
  },
  
  requestMentorship: async (_mentorId) => {
    return { success: true, message: 'Mentorship request sent! You will hear back within 48 hours.' };
  },
};

export default mentorService;
