import React, { createContext, useContext, useState, useEffect } from 'react';
import users from '../data/users.json';

const AuthContext = createContext(null);

// Simulate the logged-in user as "Riya Patel"
const CURRENT_USER = users.find(u => u.id === 'current');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Simulate checking for a stored session
    const storedAuth = localStorage.getItem('sne_auth');
    if (storedAuth) {
      setUser(CURRENT_USER);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock login — accepts any credentials
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // Simulate API delay
    setUser(CURRENT_USER);
    setIsAuthenticated(true);
    localStorage.setItem('sne_auth', 'true');
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('sne_auth');
  };

  const register = async (formData) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const newUser = { ...CURRENT_USER, ...formData, id: 'current' };
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('sne_auth', 'true');
    setIsLoading(false);
    return { success: true };
  };

  const updateProfile = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
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
