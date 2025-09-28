// If you have src/components/Overview.jsx, replace with:
import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiDollarSign, FiShoppingCart, FiCalendar, FiCoffee, FiRefreshCw } from 'react-icons/fi';
import { adminAPI } from '../services/api';

const Overview = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const statsData = await adminAPI.getDashboardStats();
      setStats(statsData);
    } catch (err) {
      setError('Failed to load overview data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <FiRefreshCw className="animate-spin text-2xl text-primary-500" />
        <span className="ml-2">Loading overview...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button onClick={fetchStats} className="px-4 py-2 bg-primary-500 text-white rounded">
          Retry
        </button>
      </div>
    );
  }

  const overviewCards = [
    { icon: FiShoppingCart, label: 'Total Orders', value: stats.totalOrders || 0, color: 'blue' },
    { icon: FiDollarSign, label: 'Total Revenue', value: `$${(stats.totalRevenue || 0).toFixed(2)}`, color: 'green' },
    { icon: FiCalendar, label: 'Reservations', value: stats.totalReservations || 0, color: 'purple' },
    { icon: FiCoffee, label: 'Menu Items', value: stats.totalMenuItems || 0, color: 'orange' },
    { icon: FiTrendingUp, label: "Today's Orders", value: stats.todayOrders || 0, color: 'indigo' },
    { icon: FiUsers, label: 'Pending Orders', value: stats.pendingOrders || 0, color: 'yellow' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <button 
          onClick={fetchStats}
          className="flex items-center px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          <FiRefreshCw className="mr-2" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${card.color}-100 text-${card.color}-600`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>New orders today</span>
              <span className="font-semibold">{stats.todayOrders || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending reservations</span>
              <span className="font-semibold">{stats.pendingReservations || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Total menu items</span>
              <span className="font-semibold">{stats.totalMenuItems || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold mb-4">Performance</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total revenue</span>
              <span className="font-semibold text-green-600">${(stats.totalRevenue || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed orders</span>
              <span className="font-semibold">{stats.totalOrders || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>System status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;