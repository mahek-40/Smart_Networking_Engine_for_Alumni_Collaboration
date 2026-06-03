import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ProjectContext = createContext(null);

const STORAGE_KEY = 'sne_projects';

export const ProjectProvider = ({ children }) => {
  const [projectStatus, setProjectStatus] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projectStatus));
  }, [projectStatus]);

  const applyToProject = useCallback((projectId) => {
    setProjectStatus(prev => ({ ...prev, [projectId]: 'pending' }));
  }, []);

  const acceptApplication = useCallback((projectId) => {
    setProjectStatus(prev => ({ ...prev, [projectId]: 'accepted' }));
  }, []);

  const rejectApplication = useCallback((projectId) => {
    setProjectStatus(prev => ({ ...prev, [projectId]: 'rejected' }));
  }, []);

  const getProjectStatus = useCallback((projectId) => {
    return projectStatus[projectId] || 'none';
  }, [projectStatus]);

  const getAllApplied = useCallback(() => {
    return Object.entries(projectStatus)
      .filter(([, status]) => status === 'pending')
      .map(([projectId]) => projectId);
  }, [projectStatus]);

  const getAllAccepted = useCallback(() => {
    return Object.entries(projectStatus)
      .filter(([, status]) => status === 'accepted')
      .map(([projectId]) => projectId);
  }, [projectStatus]);

  const getAllRejected = useCallback(() => {
    return Object.entries(projectStatus)
      .filter(([, status]) => status === 'rejected')
      .map(([projectId]) => projectId);
  }, [projectStatus]);

  return (
    <ProjectContext.Provider value={{
      projectStatus,
      applyToProject,
      acceptApplication,
      rejectApplication,
      getProjectStatus,
      getAllApplied,
      getAllAccepted,
      getAllRejected,
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
};

export default ProjectContext;
