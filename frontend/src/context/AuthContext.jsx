// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8080';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${API_ORIGIN}/api/auth/validate`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        let userData = null;
        try {
          const raw = localStorage.getItem('user');
          userData = raw ? JSON.parse(raw) : null;
        } catch (_) {
          userData = null;
        }
        setAuthState({
          isAuthenticated: true,
          user: userData,
          token,
        });
      } else {
        logout();
      }
    } catch (e) {
      console.error('Auth check failed:', e);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password, userType = 'admin') => {
    try {
      setError('');

      const response = await fetch(`${API_ORIGIN}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        let msg = 'Login failed';
        try {
          const txt = await response.text();
          if (txt) {
            const parsed = JSON.parse(txt);
            msg = parsed.message || parsed.error || txt;
          }
        } catch (_) {
          // use default msg
        }
        throw new Error(msg);
      }

      const data = await response.json();

      // role gate
      if (userType === 'waiter' && data.role !== 'WAITER') {
        throw new Error('Access denied. Waiter login only.');
      }
      if (userType === 'admin' && data.role !== 'ADMIN') {
        throw new Error('Access denied. Admin login only.');
      }

    
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      setAuthState({
        isAuthenticated: true,
        user: data,
        token: data.token,
      });

      return { success: true, data };
    } catch (e) {
      setError(e.message || 'Login failed');
      return { success: false, error: e.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken'); 
    localStorage.removeItem('user');
    setAuthState({ isAuthenticated: false, user: null, token: null });
    setError('');
  };

  const value = {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    isAdmin: authState.user?.role === 'ADMIN',
    isWaiter: authState.user?.role === 'WAITER',
    loading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
