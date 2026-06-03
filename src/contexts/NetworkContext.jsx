import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NetworkContext = createContext(null);

const STORAGE_KEY = 'sne_connections';

export const NetworkProvider = ({ children }) => {
  const [connections, setConnections] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Persist to localStorage whenever connections change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
  }, [connections]);

  const sendRequest = useCallback((userId) => {
    setConnections(prev => ({ ...prev, [userId]: 'pending' }));
  }, []);

  const acceptRequest = useCallback((userId) => {
    setConnections(prev => ({ ...prev, [userId]: 'accepted' }));
  }, []);

  const rejectRequest = useCallback((userId) => {
    setConnections(prev => ({ ...prev, [userId]: 'rejected' }));
  }, []);

  const getStatus = useCallback((userId) => {
    return connections[userId] || 'none';
  }, [connections]);

  const getAllPending = useCallback(() => {
    return Object.entries(connections)
      .filter(([, status]) => status === 'pending')
      .map(([userId]) => userId);
  }, [connections]);

  const getAllAccepted = useCallback(() => {
    return Object.entries(connections)
      .filter(([, status]) => status === 'accepted')
      .map(([userId]) => userId);
  }, [connections]);

  const getAllRejected = useCallback(() => {
    return Object.entries(connections)
      .filter(([, status]) => status === 'rejected')
      .map(([userId]) => userId);
  }, [connections]);

  return (
    <NetworkContext.Provider value={{
      connections,
      sendRequest,
      acceptRequest,
      rejectRequest,
      getStatus,
      getAllPending,
      getAllAccepted,
      getAllRejected,
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider');
  return ctx;
};

export default NetworkContext;
