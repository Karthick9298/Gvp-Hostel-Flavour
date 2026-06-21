import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { authAPI } from '../config/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app mount: check if a token exists and validate it with backend
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');

      if (token) {
        try {
          const response = await authAPI.getMe();
          if (response.status === 'success') {
            setUser(response.data.user);
          } else {
            localStorage.removeItem('authToken');
            setUser(null);
          }
        } catch (error) {
          // Token invalid or expired → clear it
          localStorage.removeItem('authToken');
          setUser(null);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  // ── Login with email + password ──────────────────────────────
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);

      const response = await authAPI.login({ email, password });

      if (response.status === 'success') {
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data.user);
        toast.success('Login successful!');
        return { success: true };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      let errorMessage = 'Login failed';

      if (error.response?.data) {
        const errData = error.response.data;
        if (errData.errors && Array.isArray(errData.errors)) {
          errorMessage = errData.errors.map(e => e.msg).join(', ');
        } else if (errData.message) {
          errorMessage = errData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ───────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      setUser(null);
      localStorage.removeItem('authToken');
      await authAPI.logout().catch(() => {});
      toast.success('Logged out successfully');
    } catch (error) {
      // Silently fail — local state is already cleared
    }
  }, []);

  // ── Update user data in context (after profile edit) ─────────
  const updateUser = useCallback((updatedUserData) => {
    setUser(updatedUserData);
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin || false;

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    updateUser,
  }), [user, loading, isAuthenticated, isAdmin, login, logout, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
