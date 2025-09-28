// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AuthContext = createContext();

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
  const [error, setError] = useState('');

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Validate token with backend
        const response = await fetch('http://localhost:8080/api/auth/validate', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = JSON.parse(localStorage.getItem('userData'));
          setUser(userData);
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // In AuthContext.jsx, add console logs:
  const login = async (username, password) => {
    try {
      console.log('🔄 Attempting login with:', username);
      setError('');
      setLoading(true);
      
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('📡 Login response status:', response.status);
      console.log('📡 Login response ok:', response.ok);

      const data = await response.json();
      console.log('📦 Login response data:', data);

      if (response.ok) {
        console.log('✅ Login successful, token:', data.token);
        localStorage.setItem('authToken', data.token);
        const userData = {
          username: data.username,
          role: data.role
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      } else {
        console.log('❌ Login failed:', data.message);
        setError(data.message || 'Login failed');
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('💥 Network error:', error);
      setError('Network error. Please check backend connection.');
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setError('');
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};