import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { request } from '../utils/apiClient';

const AuthContext = createContext(null);

const AVATAR_COLORS = [
  '#f97316', '#fbbf24', '#fb923c', '#2ed573',
  '#ffa502', '#ff4757', '#ff6b9d', '#26de81',
];

function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    role: user.role?.toLowerCase(),
  };
}

export function AuthProvider({ children }) {
  const [users, setUsers]     = useState([]);
  const [session, setSession] = useLocalStorage('sct_session', null);
  const [currentUser, setCurrentUser] = useState(normalizeUser(session?.user));

  // Keep in-memory auth state aligned with stored session.
  useEffect(() => {
    setCurrentUser(normalizeUser(session?.user));
  }, [session]);

  const register = useCallback(async (username, email, password, role) => {
    const auth = await request('/auth/register', {
      method: 'POST',
      body: {
        username: username.trim(),
        email: email.trim(),
        password,
        role,
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      },
    });

    const sessionData = {
      token: auth.token,
      user: normalizeUser(auth.user),
    };

    setSession(sessionData);
    setCurrentUser(sessionData.user);
    return sessionData.user;
  }, [setSession]);

  const login = useCallback(async (email, password) => {
    const auth = await request('/auth/login', {
      method: 'POST',
      body: {
        email: email.trim(),
        password,
      },
    });

    const sessionData = {
      token: auth.token,
      user: normalizeUser(auth.user),
    };

    setSession(sessionData);
    setCurrentUser(sessionData.user);
    return sessionData.user;
  }, [setSession]);

  const logout = useCallback(() => {
    setSession(null);
    setCurrentUser(null);
    setUsers([]);
  }, [setSession]);

  const loadUsers = useCallback(async () => {
    const allUsers = await request('/users');
    setUsers(allUsers.map(normalizeUser));
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadUsers().catch(err => console.error('Failed to load users', err));
      return;
    }
    setUsers([]);
  }, [currentUser, loadUsers]);

  const getAllUsersForAdmin = useCallback(() => {
    return users;
  }, [users]);

  const updateCurrentUserPoints = useCallback((pointsToAdd) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      const updatedUser = { ...prev, points: (prev.points || 0) + pointsToAdd };
      setSession(prevSession => ({ ...prevSession, user: updatedUser }));
      return updatedUser;
    });
  }, [setSession]);

  const value = {
    currentUser,
    login,
    logout,
    register,
    loadUsers,
    getAllUsersForAdmin,
    updateCurrentUserPoints,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
