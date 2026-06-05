import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';

export const analyticsService = {
  getAll: async () => {
    const overview = await apiClient.get(API_ENDPOINTS.ANALYTICS_OVERVIEW);
    const skills = await apiClient.get(API_ENDPOINTS.ANALYTICS_SKILLS);
    const industries = await apiClient.get(API_ENDPOINTS.ANALYTICS_INDUSTRIES);
    
    return {
      kpis: overview.data?.metrics || {},
      topSkills: skills.data || [],
      topIndustries: industries.data || [],
      recentActivities: overview.data?.recent_activities || [],
    };
  },
  
  getKPIs: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS_OVERVIEW);
    return response.data?.metrics || {};
  },
  
  getProfileViews: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS_OVERVIEW);
    return response.data?.metrics || {};
  },
};

export default analyticsService;
