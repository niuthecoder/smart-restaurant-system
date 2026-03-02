import React, { useState } from 'react';
import { FiLock, FiUser, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(credentials.username, credentials.password);
      if (result.success) {
        onLogin(true);
      } else {
        setError('Invalid credentials.');
      }
    } catch {
      setError('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-primary-600">🍔</span>
            <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
              ADMIN PANEL
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Restaurant Dashboard</h2>
          <p className="text-gray-600">Sign in to manage your restaurant</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiUser className="inline mr-2" />
              Username
            </label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiLock className="inline mr-2" />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition-all transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : <>Sign In <FiArrowRight className="ml-2" /></>}
          </button>
        </form>

        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-xl text-sm text-yellow-800">
            <strong>Demo Credentials:</strong><br />
            Username: <code>admin</code><br />
            Password: <code>admin123</code>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;