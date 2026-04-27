import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { request } from '../utils/apiClient';
import { useAuth } from './AuthContext';
import { deriveCertStatus } from '../utils/certUtils';
import { getMonthKey } from '../utils/dateUtils';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { currentUser, updateCurrentUserPoints } = useAuth();
  const [certifications, setCertifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const loadCertifications = useCallback(async () => {
    if (!currentUser) {
      setCertifications([]);
      return;
    }
    const certs = currentUser.role === 'admin'
      ? await request('/certifications')
      : await request(`/certifications/user/${currentUser.id}`);
    setCertifications(certs || []);
  }, [currentUser]);

  const loadAchievements = useCallback(async () => {
    if (!currentUser) {
      setAchievements([]);
      return;
    }
    const items = await request(`/achievements/user/${currentUser.id}`);
    setAchievements(items || []);
  }, [currentUser]);

  const loadNotifications = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    const notes = await request(`/notifications/user/${currentUser.id}`);
    setNotifications(notes || []);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setCertifications([]);
      setAchievements([]);
      setNotifications([]);
      return;
    }

    Promise.all([
      loadCertifications(),
      loadAchievements(),
      loadNotifications(),
    ]).catch(err => {
      console.error('Failed to load app data', err);
    });
  }, [currentUser, loadAchievements, loadCertifications, loadNotifications]);

  /* ---- CERTIFICATIONS ---- */
  const addCert = useCallback(async (payload) => {
    const cert = await request('/certifications', {
      method: 'POST',
      body: payload,
    });
    setCertifications(prev => [cert, ...prev]);
    if (cert.verificationStatus === 'verified' && updateCurrentUserPoints) {
      updateCurrentUserPoints(100);
    }
    return cert;
  }, [updateCurrentUserPoints]);

  const updateCert = useCallback(async (id, changes) => {
    const previous = certifications.find(c => c.id === id);
    const updated = await request(`/certifications/${id}`, {
      method: 'PUT',
      body: changes,
    });
    setCertifications(prev =>
      prev.map(c => c.id === id
        ? updated
        : c
      )
    );
    if (previous && previous.verificationStatus !== 'verified' && updated.verificationStatus === 'verified' && updateCurrentUserPoints) {
      updateCurrentUserPoints(100);
    }
    return updated;
  }, [certifications, updateCurrentUserPoints]);

  const deleteCert = useCallback(async (id) => {
    await request(`/certifications/${id}`, {
      method: 'DELETE',
    });
    setCertifications(prev => prev.filter(c => c.id !== id));
  }, []);

  const getCertsByUser = useCallback((userId) => {
    return certifications
      .filter(c => c.userId === userId)
      .map(c => ({ ...c, status: deriveCertStatus(c.expiryDate) }));
  }, [certifications]);

  const getAllCerts = useCallback(() => {
    return certifications.map(c => ({ ...c, status: deriveCertStatus(c.expiryDate) }));
  }, [certifications]);

  /* ---- ACHIEVEMENTS ---- */
  const addAchievement = useCallback(async (payload) => {
    const item = await request('/achievements', {
      method: 'POST',
      body: payload,
    });
    setAchievements(prev => [item, ...prev]);
    if (updateCurrentUserPoints) updateCurrentUserPoints(50);
    return item;
  }, [updateCurrentUserPoints]);

  const updateAchievement = useCallback(async (id, changes) => {
    const updated = await request(`/achievements/${id}`, {
      method: 'PUT',
      body: changes,
    });
    setAchievements(prev => prev.map(a => a.id === id ? updated : a));
    return updated;
  }, []);

  const deleteAchievement = useCallback(async (id) => {
    await request(`/achievements/${id}`, {
      method: 'DELETE',
    });
    setAchievements(prev => prev.filter(a => a.id !== id));
  }, []);

  const getAchievementsByUser = useCallback((userId) => {
    return achievements
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [achievements]);

  /* ---- NOTIFICATIONS ---- */
  const sendNotification = useCallback(async (toUserId, certId, message, senderAdminId) => {
    const note = await request('/notifications', {
      method: 'POST',
      body: {
        recipientUserId: toUserId,
        senderAdminId,
        type: 'renewal_notice',
        message,
        relatedCertId: certId,
      },
    });

    if (currentUser?.id === toUserId) {
      setNotifications(prev => [note, ...prev]);
    }

    setCertifications(prev =>
      prev.map(c => c.id === certId ? { ...c, notified: true, updatedAt: new Date().toISOString() } : c)
    );
    return note;
  }, [currentUser]);

  const markNotificationRead = useCallback(async (id) => {
    await request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(async (userId) => {
    await request(`/notifications/user/${userId}/read-all`, {
      method: 'PUT',
    });
    setNotifications(prev =>
      prev.map(n => n.recipientUserId === userId ? { ...n, read: true } : n)
    );
  }, []);

  const getNotificationsForUser = useCallback((userId) => {
    return notifications
      .filter(n => n.recipientUserId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [notifications]);

  /* ---- RENEWAL ---- */
  const markRenewed = useCallback(async (certId, newExpiryDate, note, adminId) => {
    const updated = await request(`/certifications/${certId}/renew`, {
      method: 'POST',
      body: {
        newExpiryDate,
        note,
        adminId,
      },
    });

    setCertifications(prev => prev.map(c => {
      if (c.id !== certId) {
        return c;
      }
      return {
        ...updated,
        renewalHistory: c.renewalHistory || [],
      };
    }));
    return updated;
  }, []);

  /* ---- ADMIN STATS ---- */
  const getSystemStats = useCallback((allUsers) => {
    const certs = certifications.map(c => ({ ...c, status: deriveCertStatus(c.expiryDate) }));
    const stats = {
      totalUsers:    allUsers?.length || 0,
      totalCerts:    certs.length,
      active:        certs.filter(c => c.status === 'active').length,
      expiring_soon: certs.filter(c => c.status === 'expiring_soon').length,
      expired:       certs.filter(c => c.status === 'expired').length,
    };
    return stats;
  }, [certifications]);

  /* ---- MONTHLY ACTIVITY ---- */
  const getMonthlyCertActivity = useCallback((userId) => {
    const src = userId
      ? certifications.filter(c => c.userId === userId)
      : certifications;
    const map = {};
    src.forEach(c => {
      const k = getMonthKey(c.createdAt);
      map[k] = (map[k] || 0) + 1;
    });
    return map;
  }, [certifications]);

  const value = {
    certifications,
    achievements,
    notifications,
    loadCertifications,
    loadAchievements,
    loadNotifications,
    addCert,
    updateCert,
    deleteCert,
    getCertsByUser,
    getAllCerts,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    getAchievementsByUser,
    sendNotification,
    markNotificationRead,
    markAllNotificationsRead,
    getNotificationsForUser,
    markRenewed,
    getSystemStats,
    getMonthlyCertActivity,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
