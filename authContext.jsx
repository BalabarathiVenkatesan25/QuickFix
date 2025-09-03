import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setAuthLoading(false);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      return user; // Return user for redirection logic
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const payload = {
        ...formData,
        skills:
          formData.role === 'professional'
            ? Array.isArray(formData.skills)
              ? formData.skills
              : []
            : [],
      };

      const response = await authAPI.register(payload);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      return user; // Return user for redirection logic
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const payload = {
        ...updates,
        skills:
          updates.role === 'professional'
            ? Array.isArray(updates.skills)
              ? updates.skills
              : []
            : [],
      };

      const response = await authAPI.updateProfile(payload);
      const user = response.data.user;
      
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      return user;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Profile update failed';
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Helper function to get dashboard path based on user role
  const getDashboardPath = useCallback((user) => {
    if (!user) return '/login';
    return user.role === 'professional' ? '/dashboard' : '/dashboard';
  }, []);

  const value = {
    currentUser,
    authLoading,
    authError,
    login,
    logout,
    register,
    updateProfile,
    getDashboardPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



