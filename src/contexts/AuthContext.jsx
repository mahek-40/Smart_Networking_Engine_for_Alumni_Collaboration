import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUserData = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        const { user: userData, profile: profileData } = response.data;
        
        const combinedUser = {
          id: userData.id || userData._id,
          email: userData.email,
          name: userData.full_name,
          full_name: userData.full_name,
          ...profileData,
          avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(userData.full_name)}`,
        };
        
        setUser(combinedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      localStorage.removeItem('sne_token');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('sne_token');
    if (token) {
      loadUserData();
    } else {
      setIsLoading(false);
    }
  }, [loadUserData]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      
      if (response.success && response.data) {
        const { access_token, user: userData } = response.data;
        localStorage.setItem('sne_token', access_token);
        
        await loadUserData();
        setIsLoading(false);
        return { success: true };
      }
      
      throw new Error('Login failed');
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('sne_token');
    localStorage.removeItem('sne_auth');
  };

  const register = async (formData) => {
    setIsLoading(true);
    try {
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        full_name: formData.name,
      });

      if (response.success) {
        const loginResponse = await login(formData.email, formData.password);
        
        if (loginResponse.success && formData.role) {
          await updateProfile({
            role: formData.role,
            skills: formData.skills || [],
            interests: formData.interests || [],
            industry: formData.industry || '',
            bio: formData.bio || '',
            career_goals: formData.careerGoals || '',
            graduation_year: formData.graduationYear ? parseInt(formData.graduationYear) : null,
            experience_years: formData.experience ? parseInt(formData.experience) : 0,
          });
        }
        
        setIsLoading(false);
        return { success: true };
      }
      
      throw new Error('Registration failed');
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PROFILE_ME, updates);
      
      if (response.success && response.data) {
        setUser(prev => ({
          ...prev,
          ...response.data,
          name: response.data.full_name,
          avatar: prev.avatar,
        }));
        return response;
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      register,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
