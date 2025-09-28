import React, { useState, useEffect } from 'react';
import { FiLogOut, FiShoppingCart, FiUsers, FiMessageSquare, FiCalendar, FiBarChart2, FiSettings, FiRefreshCw } from 'react-icons/fi';
import AdminOrders from './AdminOrders';
import AdminBookings from './AdminBookings';
import AdminMenu from './AdminMenu';
import AdminMessages from './AdminMessages';
import AdminAnalytics from './AdminAnalytics';
import { adminAPI } from '../services/api';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalReservations: 0,
    todayReservations: 0,
    totalRevenue: 0,
    totalMenuItems: 0,
    todayOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data from backend
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await adminAPI.getDashboardStats();
      console.log('📊 Dashboard stats received:', statsData);
      
      setStats({
        totalOrders: statsData.totalOrders || 0,
        pendingOrders: statsData.pendingOrders || 0,
        totalReservations: statsData.totalReservations || 0,
        todayReservations: statsData.todayReservations || 0,
        totalRevenue: statsData.totalRevenue || 0,
        totalMenuItems: statsData.totalMenuItems || 0,
        todayOrders: statsData.todayOrders || 0
      });
    } catch (err) {
      console.error('❌ Error fetching dashboard stats:', err);
      setError('Failed to load dashboard data. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <AdminOrders />;
      case 'bookings':
        return <AdminBookings />;
      case 'menu':
        return <AdminMenu />;
      case 'messages':
        return <AdminMessages />;
      case 'analytics':
        return <AdminAnalytics />;
      default:
        return (
          <div>
            {/* Header with Refresh Button */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-600">Real-time data from your restaurant</p>
                {error && (
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                )}
              </div>
              <button 
                onClick={fetchDashboardStats}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FiRefreshCw className="mr-2" />
                Refresh Data
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <FiRefreshCw className="animate-spin text-4xl text-primary-500" />
                <span className="ml-3 text-lg">Loading dashboard data...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Stats Cards with Real Data */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">Total Orders</p>
                      <h3 className="text-3xl font-bold text-gray-900">{stats.totalOrders}</h3>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <FiShoppingCart className="text-2xl text-blue-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">All orders in system</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">Pending Orders</p>
                      <h3 className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</h3>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <FiShoppingCart className="text-2xl text-green-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Need attention</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">Today's Orders</p>
                      <h3 className="text-3xl font-bold text-gray-900">{stats.todayOrders}</h3>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <FiBarChart2 className="text-2xl text-purple-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Orders placed today</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">Total Reservations</p>
                      <h3 className="text-3xl font-bold text-gray-900">{stats.totalReservations}</h3>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <FiCalendar className="text-2xl text-orange-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">All table bookings</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">Today's Reservations</p>
                      <h3 className="text-3xl font-bold text-gray-900">{stats.todayReservations}</h3>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <FiCalendar className="text-2xl text-red-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Bookings for today</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">Menu Items</p>
                      <h3 className="text-3xl font-bold text-gray-900">{stats.totalMenuItems}</h3>
                    </div>
                    <div className="p-3 bg-indigo-100 rounded-full">
                      <FiSettings className="text-2xl text-indigo-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Total menu items</p>
                </div>

                {/* Revenue Card - Full Width */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 md:col-span-2 lg:col-span-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">Total Revenue</p>
                      <h3 className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</h3>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <FiBarChart2 className="text-2xl text-green-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Revenue from completed orders</p>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2 lg:col-span-3">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all text-center group"
                    >
                      <FiShoppingCart className="text-2xl text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-blue-700">Manage Orders</span>
                      <p className="text-xs text-gray-600 mt-1">{stats.pendingOrders} pending</p>
                    </button>
                    <button 
                      onClick={() => setActiveTab('bookings')}
                      className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all text-center group"
                    >
                      <FiCalendar className="text-2xl text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-green-700">View Bookings</span>
                      <p className="text-xs text-gray-600 mt-1">{stats.totalReservations} total</p>
                    </button>
                    <button 
                      onClick={() => setActiveTab('menu')}
                      className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all text-center group"
                    >
                      <FiSettings className="text-2xl text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-purple-700">Edit Menu</span>
                      <p className="text-xs text-gray-600 mt-1">{stats.totalMenuItems} items</p>
                    </button>
                    <button 
                      onClick={() => setActiveTab('analytics')}
                      className="p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all text-center group"
                    >
                      <FiBarChart2 className="text-2xl text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-orange-700">Analytics</span>
                      <p className="text-xs text-gray-600 mt-1">Detailed reports</p>
                    </button>
                  </div>
                </div>

                {/* System Status */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2 lg:col-span-3">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">System Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>Backend API</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Online</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>Database</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Connected</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>Last Update</span>
                      <span className="text-gray-600">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">🍔</span>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                Burger House Admin
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, Admin</span>
              <button
                onClick={onLogout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar & Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 bg-white rounded-2xl shadow-lg p-4 h-fit">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'overview' 
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiBarChart2 className="mr-3" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'orders' 
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiShoppingCart className="mr-3" />
                Orders
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'bookings' 
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiCalendar className="mr-3" />
                Bookings
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'menu' 
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiSettings className="mr-3" />
                Menu Management
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'messages' 
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiMessageSquare className="mr-3" />
                Messages
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'analytics' 
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiBarChart2 className="mr-3" />
                Analytics
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;