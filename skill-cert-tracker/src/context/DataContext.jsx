import { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId } from '../utils/idUtils';
import { deriveCertStatus } from '../utils/certUtils';
import { getMonthKey } from '../utils/dateUtils';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [certifications, setCertifications] = useLocalStorage('sct_certifications', []);
  const [achievements,   setAchievements]   = useLocalStorage('sct_achievements', []);
  const [notifications,  setNotifications]  = useLocalStorage('sct_notifications', []);

  /* ---- CERTIFICATIONS ---- */
  const addCert = useCallback((payload) => {
    const cert = {
      id: generateId(),
      userId: payload.userId,
      title: payload.title,
      issuer: payload.issuer,
      credentialId: payload.credentialId || '',
      issueDate: payload.issueDate,
      expiryDate: payload.expiryDate || null,
      documentBase64: payload.documentBase64 || null,
      documentName: payload.documentName || null,
      documentMimeType: payload.documentMimeType || null,
      tags: payload.tags || [],
      renewalHistory: [],
      notified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCertifications(prev => [cert, ...prev]);
    return cert;
  }, [setCertifications]);

  const updateCert = useCallback((id, changes) => {
    setCertifications(prev =>
      prev.map(c => c.id === id
        ? { ...c, ...changes, updatedAt: new Date().toISOString() }
        : c
      )
    );
  }, [setCertifications]);

  const deleteCert = useCallback((id) => {
    setCertifications(prev => prev.filter(c => c.id !== id));
  }, [setCertifications]);

  const getCertsByUser = useCallback((userId) => {
    return certifications
      .filter(c => c.userId === userId)
      .map(c => ({ ...c, status: deriveCertStatus(c.expiryDate) }));
  }, [certifications]);

  const getAllCerts = useCallback(() => {
    return certifications.map(c => ({ ...c, status: deriveCertStatus(c.expiryDate) }));
  }, [certifications]);

  /* ---- ACHIEVEMENTS ---- */
  const addAchievement = useCallback((payload) => {
    const item = {
      id: generateId(),
      userId: payload.userId,
      title: payload.title,
      type: payload.type || 'achievement',
      description: payload.description || '',
      date: payload.date,
      icon: payload.icon || 'trophy',
      createdAt: new Date().toISOString(),
    };
    setAchievements(prev => [item, ...prev]);
    return item;
  }, [setAchievements]);

  const updateAchievement = useCallback((id, changes) => {
    setAchievements(prev => prev.map(a => a.id === id ? { ...a, ...changes } : a));
  }, [setAchievements]);

  const deleteAchievement = useCallback((id) => {
    setAchievements(prev => prev.filter(a => a.id !== id));
  }, [setAchievements]);

  const getAchievementsByUser = useCallback((userId) => {
    return achievements
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [achievements]);

  /* ---- NOTIFICATIONS ---- */
  const sendNotification = useCallback((toUserId, certId, message, senderAdminId) => {
    const note = {
      id: generateId(),
      recipientUserId: toUserId,
      senderAdminId,
      type: 'renewal_notice',
      message,
      relatedCertId: certId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [note, ...prev]);
    // mark cert as notified
    setCertifications(prev =>
      prev.map(c => c.id === certId ? { ...c, notified: true } : c)
    );
    return note;
  }, [setNotifications, setCertifications]);

  const markNotificationRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, [setNotifications]);

  const markAllNotificationsRead = useCallback((userId) => {
    setNotifications(prev =>
      prev.map(n => n.recipientUserId === userId ? { ...n, read: true } : n)
    );
  }, [setNotifications]);

  const getNotificationsForUser = useCallback((userId) => {
    return notifications
      .filter(n => n.recipientUserId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [notifications]);

  /* ---- RENEWAL ---- */
  const markRenewed = useCallback((certId, newExpiryDate, note, adminId) => {
    setCertifications(prev => prev.map(c => {
      if (c.id !== certId) return c;
      const renewal = {
        renewedAt: new Date().toISOString(),
        renewedBy: adminId,
        previousExpiry: c.expiryDate,
        newExpiry: newExpiryDate,
        note: note || '',
      };
      return {
        ...c,
        expiryDate: newExpiryDate,
        renewalHistory: [...(c.renewalHistory || []), renewal],
        notified: false,
        updatedAt: new Date().toISOString(),
      };
    }));
  }, [setCertifications]);

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
