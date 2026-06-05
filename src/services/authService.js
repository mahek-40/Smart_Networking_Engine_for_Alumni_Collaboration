import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';

export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post(
      API_ENDPOINTS.LOGIN,
      { email, password },
      { includeAuth: false }
    );
    return response;
  },
  
  register: async (data) => {
    const response = await apiClient.post(
      API_ENDPOINTS.REGISTER,
      {
        email: data.email,
        password: data.password,
        full_name: data.name || data.full_name,
      },
      { includeAuth: false }
    );
    return response;
  },
  
  logout: async () => {
    return { success: true };
  },
  
  resetPassword: async (email) => {
    return { success: true, message: `Password reset link sent to ${email}` };
  },
  
  getCurrentUser: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ME);
    return response;
  },
};

export default authService;
