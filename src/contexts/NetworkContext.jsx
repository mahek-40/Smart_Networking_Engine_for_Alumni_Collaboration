import { createContext, useContext, useState, useCallback } from 'react';
import connectionService from '../services/connectionService';

const NetworkContext = createContext(null);

export const NetworkProvider = ({ children }) => {
  const [connections, setConnections] = useState({});
  const [loading, setLoading] = useState(false);

  const loadConnectionStatuses = useCallback(async (userIds) => {
    if (!userIds || userIds.length === 0) return;
    
    try {
      const statuses = {};
      for (const userId of userIds) {
        try {
          const result = await connectionService.getStatus(userId);
          statuses[userId] = result.status || 'none';
        } catch {
          statuses[userId] = 'none';
        }
      }
      setConnections(prev => ({ ...prev, ...statuses }));
    } catch (error) {
      console.error('Failed to load connection statuses:', error);
    }
  }, []);

  const sendRequest = useCallback(async (userId) => {
    setLoading(true);
    try {
      await connectionService.sendRequest(userId);
      setConnections(prev => ({ ...prev, [userId]: 'pending' }));
    } catch (error) {
      console.error('Failed to send connection request:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptRequest = useCallback(async (userId, connectionId) => {
    setLoading(true);
    try {
      await connectionService.acceptRequest(connectionId);
      setConnections(prev => ({ ...prev, [userId]: 'accepted' }));
    } catch (error) {
      console.error('Failed to accept connection:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectRequest = useCallback(async (userId, connectionId) => {
    setLoading(true);
    try {
      await connectionService.rejectRequest(connectionId);
      setConnections(prev => ({ ...prev, [userId]: 'rejected' }));
    } catch (error) {
      console.error('Failed to reject connection:', error);
      throw error;
    } finally {
      setLoading(false);
    }
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
      loading,
      sendRequest,
      acceptRequest,
      rejectRequest,
      getStatus,
      getAllPending,
      getAllAccepted,
      getAllRejected,
      loadConnectionStatuses,
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
