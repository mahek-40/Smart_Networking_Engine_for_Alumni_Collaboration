// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  
  // User
  ME: '/api/me',
  VERSION: '/api/version',
  
  // Profile
  PROFILE_ME: '/api/profile/me',
  PROFILE_SEARCH: '/api/profile/search',
  PROFILE_BY_ID: (userId) => `/api/profile/${userId}`,
  
  // Recommendations
  RECOMMENDATIONS_SIMILAR: '/api/recommendations/similar',
  RECOMMENDATIONS_MENTORS: '/api/recommendations/mentors',
  RECOMMENDATIONS_COLLABORATE: (candidateId) => `/api/recommendations/collaborate/${candidateId}`,
  
  // Analytics
  ANALYTICS_OVERVIEW: '/api/analytics/overview',
  ANALYTICS_SKILLS: '/api/analytics/skills',
  ANALYTICS_INDUSTRIES: '/api/analytics/industries',
  ANALYTICS_RECOMMENDATIONS: '/api/analytics/recommendations-summary',
  ANALYTICS_TOP_MENTORS: '/api/analytics/top-mentors',
  
  // Connections
  CONNECTIONS_REQUEST: (userId) => `/api/connections/request/${userId}`,
  CONNECTIONS_ACCEPT: (connectionId) => `/api/connections/accept/${connectionId}`,
  CONNECTIONS_REJECT: (connectionId) => `/api/connections/reject/${connectionId}`,
  CONNECTIONS_MY: '/api/connections/my-connections',
  CONNECTIONS_PENDING: '/api/connections/pending',
  CONNECTIONS_STATUS: (userId) => `/api/connections/status/${userId}`,
  
  // Notifications
  NOTIFICATIONS: '/api/notifications',
  NOTIFICATIONS_MARK_READ: (notificationId) => `/api/notifications/mark-read/${notificationId}`,
  NOTIFICATIONS_MARK_ALL_READ: '/api/notifications/mark-all-read',
  NOTIFICATIONS_DELETE: (notificationId) => `/api/notifications/${notificationId}`,
  NOTIFICATIONS_UNREAD_COUNT: '/api/notifications/unread-count',
  
  // Projects
  PROJECTS: '/api/projects',
  PROJECTS_BY_ID: (projectId) => `/api/projects/${projectId}`,
  PROJECTS_APPLY: (projectId) => `/api/projects/${projectId}/apply`,
  PROJECTS_ACCEPT: (projectId, applicantId) => `/api/projects/${projectId}/accept/${applicantId}`,
  PROJECTS_REJECT: (projectId, applicantId) => `/api/projects/${projectId}/reject/${applicantId}`,
  PROJECTS_MY: '/api/projects/my/projects',
  
  // Admin
  ADMIN_SEED: '/api/admin/seed',
  
  // Health
  HEALTH: '/health',
  ROOT: '/',
};

export { API_BASE_URL };
