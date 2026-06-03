import React, { createContext, useContext, useState, useEffect } from 'react';
import users from '../data/users.json';

const AuthContext = createContext(null);

const DEMO_USER = users.find(u => u.id === 'current');
const PROFILE_KEY = 'sne_user_profile';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem('sne_auth');
    if (storedAuth) {
      // Load persisted profile if it exists, otherwise fall back to demo user
      try {
        const storedProfile = localStorage.getItem(PROFILE_KEY);
        const profileData = storedProfile ? JSON.parse(storedProfile) : DEMO_USER;
        setUser(profileData);
      } catch {
        setUser(DEMO_USER);
      }
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    // Check if there's a stored profile from registration
    try {
      const storedProfile = localStorage.getItem(PROFILE_KEY);
      const profileData = storedProfile ? JSON.parse(storedProfile) : DEMO_USER;
      setUser(profileData);
    } catch {
      setUser(DEMO_USER);
    }

    setIsAuthenticated(true);
    localStorage.setItem('sne_auth', 'true');
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('sne_auth');
    // Don't remove profile data on logout so it persists across sessions
  };

  const register = async (formData) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));

    // Build a complete user profile from form data
    const newUser = {
      ...DEMO_USER,
      id: 'current',
      name: formData.name || DEMO_USER.name,
      email: formData.email || DEMO_USER.email,
      role: formData.role || DEMO_USER.role,
      company: formData.company || DEMO_USER.company,
      industry: formData.industry || DEMO_USER.industry,
      experience: formData.experience || DEMO_USER.experience,
      skills: formData.skills?.length ? formData.skills : DEMO_USER.skills,
      interests: formData.interests?.length ? formData.interests : DEMO_USER.interests,
      bio: formData.bio || DEMO_USER.bio,
      careerGoals: formData.careerGoals || DEMO_USER.careerGoals,
      // Education fields from registration
      university: formData.university || DEMO_USER.university,
      degree: formData.degree || DEMO_USER.degree,
      branch: formData.branch || DEMO_USER.branch,
      graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : DEMO_USER.graduationYear,
      // Avatar uses name as seed for uniqueness
      avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(formData.name || DEMO_USER.name)}`,
    };

    // Persist the user profile to localStorage
    localStorage.setItem(PROFILE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('sne_auth', 'true');
    setIsLoading(false);
    return { success: true };
  };

  const updateProfile = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      // Persist updated profile
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      return updated;
    });
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
