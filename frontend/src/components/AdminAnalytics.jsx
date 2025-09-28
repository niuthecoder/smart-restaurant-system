// src/components/AdminAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiDollarSign, FiShoppingCart, FiCalendar, FiMessageSquare, FiRefreshCw, FiCoffee, FiClock } from 'react-icons/fi';
import { adminAPI } from '../services/api';

const AdminAnalytics = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching analytics data...');
      const statsData = await adminAPI.getDashboardStats();
      console.log('Analytics data received:', statsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to fetch analytics data. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const dashboardStats = [
    { 
      label: 'Total Revenue', 
      value: `$${(stats.totalRevenue || 0).toFixed(2)}`, 
      icon: FiDollarSign, 
      color: 'green' 
    },
    { 
      label: 'Total Orders', 
      value: (stats.totalOrders || 0).toString(), 
      icon: FiShoppingCart, 
      color: 'blue' 
    },
    { 
      label: 'Pending Orders', 
      value: (stats.pendingOrders || 0).toString(), 
      icon: FiClock, 
      color: 'yellow' 
    },
    { 
      label: "Today's Orders", 
      value: (stats.todayOrders || 0).toString(), 
      icon: FiTrendingUp, 
      color: 'purple' 
    },
    { 
      label: 'Total Reservations', 
      value: (stats.totalReservations || 0).toString(), 
      icon: FiCalendar, 
      color: 'indigo' 
    },
    { 
      label: 'Menu Items', 
      value: (stats.totalMenuItems || 0).toString(), 
      icon: FiCoffee, 
      color: 'orange' 
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <FiRefreshCw className="animate-spin text-4xl text-primary-500" />
        <span className="ml-3 text-lg">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
        <button 
          onClick={fetchAnalyticsData}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h2>
          <p className="text-gray-600">Real-time data from your restaurant</p>
        </div>
        <button 
          onClick={fetchAnalyticsData}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
        >
          <FiRefreshCw className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            green: 'bg-green-100 text-green-600',
            blue: 'bg-blue-100 text-blue-600',
            yellow: 'bg-yellow-100 text-yellow-600',
            purple: 'bg-purple-100 text-purple-600',
            indigo: 'bg-indigo-100 text-indigo-600',
            orange: 'bg-orange-100 text-orange-600'
          };
          
          return (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${colorClasses[stat.color]}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Debug Info */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <pre className="text-sm">{JSON.stringify(stats, null, 2)}</pre>
      </div>
    </div>
  );
};

export default AdminAnalytics;