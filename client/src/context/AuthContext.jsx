import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dayflow_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('dayflow_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setUnreadCount(data.unreadNotificationsCount || 0);
    } catch (err) {
      console.error('Failed to load authenticated user profile:', err);
      localStorage.removeItem('dayflow_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials) => {
    const data = await api.login(credentials);
    localStorage.setItem('dayflow_token', data.token);
    setToken(data.token);
    setUser(data.user);
    await fetchCurrentUser();
    return data;
  };

  const register = async (userData) => {
    return await api.register(userData);
  };

  const verifyEmail = async (verificationData) => {
    const data = await api.verifyEmail(verificationData);
    if (data.token) {
      localStorage.setItem('dayflow_token', data.token);
      setToken(data.token);
      setUser(data.user);
      await fetchCurrentUser();
    }
    return data;
  };

  const quickLogin = async (role) => {
    const data = await api.quickLogin(role);
    localStorage.setItem('dayflow_token', data.token);
    setToken(data.token);
    setUser(data.user);
    await fetchCurrentUser();
    return data;
  };

  const logout = () => {
    localStorage.removeItem('dayflow_token');
    setToken(null);
    setUser(null);
    setUnreadCount(0);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        unreadCount,
        setUnreadCount,
        login,
        register,
        verifyEmail,
        quickLogin,
        logout,
        refreshUser,
        isAdmin: user?.role === 'hr_admin',
        isEmployee: user?.role === 'employee',
        isAuthenticated: !!user && user.isVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
