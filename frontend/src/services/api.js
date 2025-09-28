// src/services/api.js - COMPLETE VERSION WITH ALL EXPORTS
const API_BASE_URL = 'http://localhost:8080/api';

// Generic API request function
// Temporary debug version of apiRequest in api.js
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('🔄 Making API request to:', url);
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  // Add token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log('🔐 Including auth token');
  } else {
    console.log('⚠️ No auth token found');
  }

  try {
    const response = await fetch(url, config);
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ API success:', data);
    return data;
    
  } catch (error) {
    console.error('💥 API request failed:', error);
    throw error;
  }
};

// Test connection
export const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`);
    return response.ok;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  console.log('🔐 Current auth token:', token ? 'Present' : 'Missing');
  
  if (token) {
    return { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
  return { 'Content-Type': 'application/json' };
};


// ===== ADMIN API (for admin dashboard) =====
export const adminAPI = {
  // Dashboard Analytics
  getDashboardStats: async () => await apiRequest('/admin/dashboard/stats'),
  
  // Orders
  getOrders: async () => await apiRequest('/admin/orders'),
  getOrdersByStatus: async (status) => await apiRequest(`/admin/orders/status/${status}`),
  updateOrderStatus: async (id, status) => await apiRequest(`/admin/orders/${id}/status`, {
    method: 'PUT',
    body: { status },
  }),
  
  // Reservations
  getReservations: async () => await apiRequest('/admin/reservations'),
  getReservationsByStatus: async (status) => await apiRequest(`/admin/reservations/status/${status}`),
  updateReservationStatus: async (id, status) => await apiRequest(`/admin/reservations/${id}/status`, {
    method: 'PUT',
    body: { status },
  }),
  
  // Menu Items
  getMenuItems: async () => await apiRequest('/admin/menu-items'),
  createMenuItem: async (menuItem) => await apiRequest('/admin/menu-items', {
    method: 'POST',
    body: menuItem,
  }),
  updateMenuItem: async (id, menuItem) => await apiRequest(`/admin/menu-items/${id}`, {
    method: 'PUT',
    body: menuItem,
  }),
  deleteMenuItem: async (id) => await apiRequest(`/admin/menu-items/${id}`, {
    method: 'DELETE',
  }),
};

// ===== COMPATIBILITY EXPORTS (for your existing components) =====
export const menuAPI = {
  getMenuItems: async () => await apiRequest('/menuitems'),
  getMenuItem: async (id) => await apiRequest(`/menuitems/${id}`),
  createMenuItem: async (menuItem) => await apiRequest('/menuitems', {
    method: 'POST',
    body: menuItem,
  }),
  updateMenuItem: async (id, menuItem) => await apiRequest(`/menuitems/${id}`, {
    method: 'PUT',
    body: menuItem,
  }),
  deleteMenuItem: async (id) => await apiRequest(`/menuitems/${id}`, {
    method: 'DELETE',
  }),
};

export const ordersAPI = {
  createOrder: async (orderData) => await apiRequest('/orders', {
    method: 'POST',
    body: orderData,
  }),
  getOrders: async () => await apiRequest('/orders'),
  getOrder: async (id) => await apiRequest(`/orders/${id}`),
  updateOrderStatus: async (id, status) => await apiRequest(`/orders/${id}/status`, {
    method: 'PUT',
    body: { status },
  }),
};

export const tablesAPI = {
  createBooking: async (bookingData) => await apiRequest('/tables', {
    method: 'POST',
    body: bookingData,
  }),
  getBookings: async () => await apiRequest('/tables'),
  getBooking: async (id) => await apiRequest(`/tables/${id}`),
  updateBooking: async (id, bookingData) => await apiRequest(`/tables/${id}`, {
    method: 'PUT',
    body: bookingData,
  }),
  cancelBooking: async (id) => await apiRequest(`/tables/${id}`, {
    method: 'DELETE',
  }),
};

export const contactAPI = {
  submitContact: async (contactData) => await apiRequest('/contact', {
    method: 'POST',
    body: contactData,
  }),
  getContacts: async () => await apiRequest('/contact'),
};

// ===== ANALYTICS API =====
export const analyticsAPI = {
  getDashboardStats: async () => await apiRequest('/admin/dashboard/stats'),
  getRevenueData: async (period = 'weekly') => await apiRequest(`/analytics/revenue?period=${period}`),
  getPopularItems: async () => await apiRequest('/analytics/popular-items'),
};

export default apiRequest;