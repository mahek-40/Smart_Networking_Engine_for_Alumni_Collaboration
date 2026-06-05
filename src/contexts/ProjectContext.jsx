import { createContext, useContext, useState, useCallback } from 'react';
import projectService from '../services/projectService';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projectStatus, setProjectStatus] = useState({});
  const [loading, setLoading] = useState(false);

  const applyToProject = useCallback(async (projectId) => {
    setLoading(true);
    try {
      await projectService.apply(projectId);
      setProjectStatus(prev => ({ ...prev, [projectId]: 'pending' }));
    } catch (error) {
      console.error('Failed to apply to project:', error);
      throw error;
    } finally {
      setLoading(false);
    }
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
      loading,
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
