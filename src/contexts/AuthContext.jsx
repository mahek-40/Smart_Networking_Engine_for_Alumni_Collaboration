import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext(null);

// Convert experience-level label from the registration form into a numeric year
// value compatible with the backend's experience_years integer field.
function parseExperienceYears(label) {
  if (!label) return 0;
  if (label.startsWith('Student') || label.startsWith('0')) return 0;
  const match = label.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUserData = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        const { user: userData, profile: profileData } = response.data;
        const p = profileData || {};

        const combinedUser = {
          id: userData.id || userData._id,
          email: userData.email,
          name: userData.full_name,
          full_name: userData.full_name,
          // Spread raw profile so all backend fields are present
          ...p,
          // Explicit camelCase aliases for every snake_case backend field
          careerGoals: p.career_goals ?? '',
          career_goals: p.career_goals ?? '',
          graduationYear: p.graduation_year ?? null,
          graduation_year: p.graduation_year ?? null,
          experienceYears: p.experience_years ?? 0,
          experience_years: p.experience_years ?? 0,
          university: p.university ?? '',
          degree: p.degree ?? '',
          branch: p.branch ?? '',
          company: p.company ?? '',
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

        if (loginResponse.success) {
          // Build the full profile payload — include every field from the
          // multi-step form so nothing gets silently dropped.
          const profilePayload = {
            role: formData.role || 'Alumni',
            skills: formData.skills || [],
            interests: formData.interests || [],
            industry: formData.industry || '',
            bio: formData.bio || '',
            career_goals: formData.careerGoals || '',
            graduation_year: formData.graduationYear
              ? parseInt(formData.graduationYear)
              : null,
            experience_years: formData.experience
              ? parseExperienceYears(formData.experience)
              : 0,
            university: formData.university || '',
            degree: formData.degree || '',
            branch: formData.branch || '',
            company: formData.company || '',
            full_name: formData.name || '',
          };

          // Only send fields that the backend ProfileUpdate model accepts;
          // unknown fields are ignored by FastAPI when extra="ignore".
          try {
            await updateProfile(profilePayload);
          } catch (profileErr) {
            // Profile update failure should not block successful registration.
            console.warn('Profile update after registration failed:', profileErr);
          }
        }

        setIsLoading(false);
        return { success: true };
      }

      // Backend returned success:false — surface the message.
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      setIsLoading(false);
      // Re-throw with the real message so the UI can display it.
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PROFILE_ME, updates);

      if (response.success && response.data) {
        const data = response.data;

        // Map backend snake_case → frontend camelCase so every page
        // that reads user.careerGoals / user.graduationYear works correctly.
        setUser(prev => ({
          ...prev,
          ...data,
          // Explicit camelCase aliases
          name: data.full_name || prev.name,
          full_name: data.full_name || prev.full_name,
          careerGoals: data.career_goals ?? prev.careerGoals,
          career_goals: data.career_goals ?? prev.career_goals,
          graduationYear: data.graduation_year ?? prev.graduationYear,
          graduation_year: data.graduation_year ?? prev.graduation_year,
          experienceYears: data.experience_years ?? prev.experienceYears,
          experience_years: data.experience_years ?? prev.experience_years,
          university: data.university ?? prev.university ?? '',
          degree: data.degree ?? prev.degree ?? '',
          branch: data.branch ?? prev.branch ?? '',
          company: data.company ?? prev.company ?? '',
          avatar: prev.avatar, // keep generated avatar
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
