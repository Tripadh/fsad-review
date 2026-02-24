import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId } from '../utils/idUtils';

const AuthContext = createContext(null);

const AVATAR_COLORS = [
  '#f97316', '#fbbf24', '#fb923c', '#2ed573',
  '#ffa502', '#ff4757', '#ff6b9d', '#26de81',
];

function hashPassword(password) {
  // Demo-grade hash — not production safe
  return btoa(password + '_sct_salt_2024');
}

const DEMO_ADMIN = {
  id: 'admin-default-001',
  username: 'Admin',
  email: 'admin@certtracker.com',
  passwordHash: hashPassword('admin123'),
  role: 'admin',
  createdAt: new Date().toISOString(),
  avatarColor: '#f97316',
};

export function AuthProvider({ children }) {
  const [users, setUsers]     = useLocalStorage('sct_users', [DEMO_ADMIN]);
  const [session, setSession] = useLocalStorage('sct_session', null);
  const [currentUser, setCurrentUser] = useState(session);

  // Sync in-memory state from stored session on mount
  useEffect(() => {
    setCurrentUser(session);
  }, []);

  const register = useCallback((username, email, password, role) => {
    // Validate uniqueness
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('This username is already taken.');
    }

    const newUser = {
      id: generateId(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      role,
      createdAt: new Date().toISOString(),
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    };

    setUsers(prev => [...prev, newUser]);

    const sessionUser = { ...newUser };
    delete sessionUser.passwordHash;
    setSession(sessionUser);
    setCurrentUser(sessionUser);
    return sessionUser;
  }, [users, setUsers, setSession]);

  const login = useCallback((email, password) => {
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) throw new Error('No account found with this email.');
    if (user.passwordHash !== hashPassword(password)) {
      throw new Error('Incorrect password. Please try again.');
    }

    const sessionUser = { ...user };
    delete sessionUser.passwordHash;
    setSession(sessionUser);
    setCurrentUser(sessionUser);
    return sessionUser;
  }, [users, setSession]);

  const logout = useCallback(() => {
    setSession(null);
    setCurrentUser(null);
  }, [setSession]);

  const getAllUsersForAdmin = useCallback(() => {
    return users.map(u => {
      const safe = { ...u };
      delete safe.passwordHash;
      return safe;
    });
  }, [users]);

  const value = {
    currentUser,
    login,
    logout,
    register,
    getAllUsersForAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
