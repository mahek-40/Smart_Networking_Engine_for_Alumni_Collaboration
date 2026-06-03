import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';

import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import Dashboard from '../pages/Dashboard';
import ProfilePage from '../pages/ProfilePage';
import RecommendationsPage from '../pages/RecommendationsPage';
import MentorMatchingPage from '../pages/MentorMatchingPage';
import CollaborationPage from '../pages/CollaborationPage';
import SmartSearchPage from '../pages/SmartSearchPage';
import AnalyticsDashboard from '../pages/AnalyticsDashboard';
import SettingsPage from '../pages/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';

// New pages
import UserProfilePage from '../pages/UserProfilePage';
import NotificationsPage from '../pages/NotificationsPage';
import MyNetworkPage from '../pages/MyNetworkPage';
import MyProjectsPage from '../pages/MyProjectsPage';
import ProjectDetailsPage from '../pages/ProjectDetailsPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#0077B5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/user/:id" element={<UserProfilePage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/mentors" element={<MentorMatchingPage />} />
        <Route path="/collaboration" element={<CollaborationPage />} />
        <Route path="/projects/:id" element={<ProjectDetailsPage />} />
        <Route path="/my-projects" element={<MyProjectsPage />} />
        <Route path="/network" element={<MyNetworkPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/search" element={<SmartSearchPage />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
