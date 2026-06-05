import apiClient from '../utils/apiClient';

export const projectService = {
  create: async (projectData) => {
    const response = await apiClient.post('/api/projects', projectData);
    return response;
  },
  
  getAll: async (page = 1, pageSize = 20, statusFilter = null, skills = null) => {
    let url = `/api/projects?page=${page}&page_size=${pageSize}`;
    if (statusFilter) url += `&status_filter=${statusFilter}`;
    if (skills) url += `&skills=${skills}`;
    
    const response = await apiClient.get(url);
    return response.data || [];
  },
  
  getById: async (projectId) => {
    const response = await apiClient.get(`/api/projects/${projectId}`);
    return response.data;
  },
  
  update: async (projectId, updates) => {
    const response = await apiClient.put(`/api/projects/${projectId}`, updates);
    return response;
  },
  
  apply: async (projectId) => {
    const response = await apiClient.post(`/api/projects/${projectId}/apply`);
    return response;
  },
  
  acceptApplicant: async (projectId, applicantId) => {
    const response = await apiClient.put(`/api/projects/${projectId}/accept/${applicantId}`);
    return response;
  },
  
  rejectApplicant: async (projectId, applicantId) => {
    const response = await apiClient.put(`/api/projects/${projectId}/reject/${applicantId}`);
    return response;
  },
  
  getMyProjects: async () => {
    const response = await apiClient.get('/api/projects/my/projects');
    return response.data || [];
  },
};

export default projectService;
