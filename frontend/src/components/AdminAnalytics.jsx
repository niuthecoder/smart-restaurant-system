// src/components/AdminAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiDollarSign, FiShoppingCart, FiCalendar, FiMessageSquare, FiRefreshCw, FiCoffee, FiClock } from 'react-icons/fi';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminAnalytics = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      const statsData = await adminAPI.getDashboardStats(params);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to fetch analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleExportOrders = async () => {
    try {
      await adminAPI.downloadOrdersExport(fromDate || undefined, toDate || undefined);
    } catch (e) {
      toast.error('Export failed');
    }
  };
  const handleExportReservations = async () => {
    try {
      await adminAPI.downloadReservationsExport(fromDate || undefined, toDate || undefined);
    } catch (e) {
      toast.error('Export failed');
    }
  };

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

  const revenueByPeriod = stats.revenueByPeriod || [];
  const popularItems = stats.popularItems || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h2>
          <p className="text-gray-600">Real-time data and date range filters</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border rounded px-2 py-1" />
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border rounded px-2 py-1" />
          <button onClick={fetchAnalyticsData} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center">
            <FiRefreshCw className="mr-2" /> Apply
          </button>
          <button onClick={handleExportOrders} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">Export Orders CSV</button>
          <button onClick={handleExportReservations} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">Export Reservations CSV</button>
        </div>
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

      {/* Revenue in range (when date filter applied) */}
      {(fromDate || toDate) && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Revenue in selected range</h3>
          <p className="text-2xl font-bold text-green-600">${Number(stats.revenueInRange || 0).toFixed(2)}</p>
        </div>
      )}

      {/* Revenue by period (last 7 days) */}
      {revenueByPeriod.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue last 7 days</h3>
          <div className="space-y-2">
            {revenueByPeriod.map((day, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-gray-600">{day.date}</span>
                <span className="font-semibold">${Number(day.revenue || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular items */}
      {popularItems.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Popular items (sold)</h3>
          <ul className="space-y-2">
            {popularItems.map((item, i) => (
              <li key={i} className="flex justify-between">
                <span>{item.name}</span>
                <span className="font-semibold">{item.quantitySold} sold</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;