import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';

export const profileService = {
  getMyProfile: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PROFILE_ME);
    return response.data;
  },
  
  updateMyProfile: async (updates) => {
    const response = await apiClient.put(API_ENDPOINTS.PROFILE_ME, updates);
    return response.data;
  },
  
  getProfileById: async (userId) => {
    const response = await apiClient.get(API_ENDPOINTS.PROFILE_BY_ID(userId));
    return response.data;
  },
  
  searchProfiles: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.skills) {
      params.append('skills', filters.skills);
    }
    if (filters.interests) {
      params.append('interests', filters.interests);
    }
    if (filters.industry) {
      params.append('industry', filters.industry);
    }
    if (filters.role) {
      params.append('role', filters.role);
    }
    params.append('page', filters.page || 1);
    params.append('page_size', filters.page_size || 50);
    
    const queryString = params.toString();
    const endpoint = `${API_ENDPOINTS.PROFILE_SEARCH}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(endpoint);
    return response.data || [];
  },
};

export default profileService;
