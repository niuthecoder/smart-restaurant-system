import React, { useState, useEffect } from 'react';
import {
  FiLogOut,
  FiShoppingCart,
  FiMessageSquare,
  FiCalendar,
  FiBarChart2,
  FiSettings,
  FiRefreshCw,
  FiUsers,
} from 'react-icons/fi';

import AdminOrders from './AdminOrders';
import AdminBookings from './AdminBookings';
import AdminMenu from './AdminMenu';
import AdminMessages from './AdminMessages';
import AdminAnalytics from './AdminAnalytics';
import FloorPlan from './FloorPlan';
import AdminSettings from './AdminSettings';
import AdminWaitlist from './AdminWaitlist';
import AdminAuditLog from './AdminAuditLog';
import AdminApiKeys from './AdminApiKeys';
import AdminQr from './AdminQr';
import { FiList, FiKey, FiMaximize2 } from 'react-icons/fi';
import { adminAPI } from '../services/api';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalReservations: 0,
    todayReservations: 0,
    bookingsToday: 0,
    totalRevenue: 0,
    totalMenuItems: 0,
    todayOrders: 0,
    occupancyRate: 0,
    occupiedTables: 0,
    totalTables: 0,
    peakHours: [],
  });
  const [upcomingToday, setUpcomingToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const statsData = await adminAPI.getDashboardStats();

      setStats({
        totalOrders: statsData.totalOrders || 0,
        pendingOrders: statsData.pendingOrders || 0,
        totalReservations: statsData.totalReservations || 0,
        todayReservations: statsData.todayReservations || 0,
        bookingsToday: statsData.bookingsToday ?? statsData.todayReservations ?? 0,
        totalRevenue: statsData.totalRevenue || 0,
        totalMenuItems: statsData.totalMenuItems || 0,
        todayOrders: statsData.todayOrders || 0,
        occupancyRate: statsData.occupancyRate ?? 0,
        occupiedTables: statsData.occupiedTables ?? 0,
        totalTables: statsData.totalTables ?? 0,
        peakHours: statsData.peakHours || [],
      });
      try {
        const upcoming = await adminAPI.getUpcomingToday();
        setUpcomingToday(Array.isArray(upcoming) ? upcoming : []);
      } catch {
        setUpcomingToday([]);
      }
    } catch (err) {
      console.error('❌ Error fetching dashboard stats:', err);
      setError('Failed to load data');
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
      case 'floorplan':
        return <FloorPlan />;
      case 'settings':
        return <AdminSettings />;
      case 'waitlist':
        return <AdminWaitlist />;
      case 'audit':
        return <AdminAuditLog />;
      case 'apikeys':
        return <AdminApiKeys />;
      case 'qr':
        return <AdminQr />;
      default:
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-600">Real-time data from your restaurant</p>
                {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
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
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">Total Revenue</p>
                      <h3 className="text-3xl font-bold text-gray-900">
                        ${Number(stats.totalRevenue || 0).toFixed(2)}
                      </h3>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <FiBarChart2 className="text-2xl text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-teal-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">Bookings today</p>
                      <h3 className="text-3xl font-bold text-gray-900">{stats.bookingsToday ?? stats.todayReservations ?? 0}</h3>
                    </div>
                    <div className="p-3 bg-teal-100 rounded-full">
                      <FiCalendar className="text-2xl text-teal-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-cyan-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">Occupancy rate</p>
                      <h3 className="text-3xl font-bold text-gray-900">
                        {stats.totalTables ? `${Math.round((stats.occupancyRate ?? 0) * 100)}%` : '-'}
                      </h3>
                      <p className="text-xs text-gray-500">{stats.occupiedTables ?? 0} / {stats.totalTables ?? 0} tables</p>
                    </div>
                  </div>
                </div>
                {Array.isArray(stats.peakHours) && stats.peakHours.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-amber-500 md:col-span-2 lg:col-span-3">
                    <p className="text-gray-600 mb-2">Peak hours (today)</p>
                    <div className="flex flex-wrap gap-3">
                      {stats.peakHours.map((ph, i) => (
                        <span key={i} className="px-3 py-1 bg-amber-100 rounded-full text-sm">
                          {ph.label}: {ph.count} orders
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500 md:col-span-2 lg:col-span-3">
                  <p className="text-gray-700 font-semibold mb-3">Upcoming today</p>
                  {upcomingToday.length === 0 ? (
                    <p className="text-gray-500 text-sm">No upcoming reservations for today.</p>
                  ) : (
                    <ul className="space-y-2">
                      {upcomingToday.slice(0, 8).map((r) => (
                        <li key={r.id} className="flex justify-between text-sm">
                          <span>{r.guestName} – Table {r.tableNumber ?? r.tableId} ({r.salon})</span>
                          <span>{r.reservationTime ? new Date(r.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">🍽️</span>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                Saffron House Admin
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 bg-white rounded-2xl shadow-lg p-4 h-fit">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'overview' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiBarChart2 className="mr-3" />
                Overview
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'orders' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiShoppingCart className="mr-3" />
                Orders
              </button>

              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'bookings' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiCalendar className="mr-3" />
                Bookings
              </button>

              <button
                onClick={() => setActiveTab('menu')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'menu' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiSettings className="mr-3" />
                Menu Management
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'messages' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiMessageSquare className="mr-3" />
                Messages
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'analytics' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiBarChart2 className="mr-3" />
                Analytics
              </button>

              <button
                onClick={() => setActiveTab('floorplan')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'floorplan' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiCalendar className="mr-3" />
                Floor Plan
              </button>

              <button
                onClick={() => setActiveTab('waitlist')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'waitlist' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiUsers className="mr-3" />
                Waitlist
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'audit' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiList className="mr-3" />
                Audit log
              </button>

              <button
                onClick={() => setActiveTab('apikeys')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'apikeys' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiKey className="mr-3" />
                API keys
              </button>

              <button
                onClick={() => setActiveTab('qr')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'qr' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiMaximize2 className="mr-3" />
                QR codes
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'settings' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiSettings className="mr-3" />
                Settings
              </button>
            </nav>
          </div>

          <div className="flex-1">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
