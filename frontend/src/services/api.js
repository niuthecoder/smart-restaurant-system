// src/services/api.js
// Use VITE_API_ORIGIN in .env. Default 8080 = backend with mvn spring-boot:run; use 8081 if you use Docker (backend mapped to 8081).
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8080';
const API_BASE_URL = `${API_ORIGIN}/api`;

// --------------------
// Helpers
// --------------------
const withAuth = (headers = {}) => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  if (token) return { ...headers, Authorization: `Bearer ${token}` };
  return headers;
};

const requestJson = async (url, options = {}) => {
  const config = {
    headers: withAuth({ 'Content-Type': 'application/json', ...(options.headers || {}) }),
    ...options,
  };

  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }

  const res = await fetch(url, config);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  // for empty responses
  return res.status === 204 ? null : res.json();
};

// Requests to /api/*
const apiRequest = (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  return requestJson(url, options);
};

// Requests to root endpoints like /orders (NOT /api/orders)
const rootRequest = (path, options = {}) => {
  const url = `${API_ORIGIN}${path}`;
  return requestJson(url, options);
};

// --------------------
// SETTINGS (public branding for SaaS white-label)
// --------------------
export const settingsAPI = {
  getBranding: async (restaurantId = null) => {
    const q = restaurantId != null ? `?restaurantId=${restaurantId}` : '';
    const url = `${API_BASE_URL}/settings/branding${q}`;
    const res = await fetch(url);
    if (!res.ok) return { name: 'Restaurant', primaryColor: '#E63946', logoUrl: null, supportEmail: null, timezone: 'UTC' };
    return res.json();
  },
};

// Test connection
export const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: withAuth({}),
    });
    return response.ok;
  } catch (e) {
    return false;
  }
};

// --------------------
// ADMIN API
// --------------------
export const adminAPI = {
  getDashboardStats: async (params = {}) => {
    const q = new URLSearchParams();
    if (params.from) q.set('from', params.from);
    if (params.to) q.set('to', params.to);
    const query = q.toString();
    return apiRequest(`/admin/dashboard/stats${query ? '?' + query : ''}`);
  },
  downloadOrdersExport: async (from, to) => {
    const q = new URLSearchParams();
    if (from) q.set('from', from);
    if (to) q.set('to', to);
    const res = await fetch(`${API_BASE_URL}/admin/orders/export?${q.toString()}`, { headers: withAuth({}) });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `orders-${from || 'all'}-${to || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  },
  downloadReservationsExport: async (from, to) => {
    const q = new URLSearchParams();
    if (from) q.set('from', from);
    if (to) q.set('to', to);
    const res = await fetch(`${API_BASE_URL}/admin/reservations/export?${q.toString()}`, { headers: withAuth({}) });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `reservations-${from || 'all'}-${to || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  },

  // Admin Orders (paginated: returns { content, totalElements, ... }; we unwrap to content for backward compat)
  getOrders: async (page = 0, size = 20) => {
    const r = await apiRequest(`/admin/orders?page=${page}&size=${size}`);
    return r?.content ?? r ?? [];
  },
  updateOrderStatus: async (id, status) =>
    apiRequest(`/admin/orders/${id}/status`, { method: 'PUT', body: { status } }),

  getReservations: async (params = {}) => {
    const q = new URLSearchParams();
    if (params.date) q.set('date', params.date);
    if (params.salon) q.set('salon', params.salon);
    if (params.status) q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    const query = q.toString();
    return apiRequest(`/admin/reservations${query ? '?' + query : ''}`);
  },
  getUpcomingToday: async () => apiRequest('/admin/reservations/upcoming-today'),
  updateReservationStatus: async (id, status) =>
    apiRequest(`/admin/reservations/${id}/status`, { method: 'PUT', body: { status } }),

  getMenuItems: async () => apiRequest('/menuitems'),
  createMenuItem: async (menuItem) => apiRequest('/menuitems', { method: 'POST', body: menuItem }),
  updateMenuItem: async (id, menuItem) => apiRequest(`/menuitems/${id}`, { method: 'PUT', body: menuItem }),
  deleteMenuItem: async (id) => apiRequest(`/menuitems/${id}`, { method: 'DELETE' }),

  getRestaurant: async () => apiRequest('/admin/restaurant'),
  updateRestaurant: async (body) => apiRequest('/admin/restaurant', { method: 'PUT', body }),
  getAuditLog: async (limit = 100) => apiRequest(`/admin/audit-log?limit=${limit}`),
  downloadMenuExport: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/menu/export`, { headers: withAuth({}) });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'menu.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  },
};

// --------------------
// WAITER API
// (waiter-specific endpoints and helpers)
// --------------------
export const waiterAPI = {
  // Tables for waiter dashboard (namespaced under /api/waiter)
  getTables: async () => apiRequest('/waiter/tables'),

  getActiveOrders: async () => apiRequest('/waiter/orders/active'),
  updateOrderStatus: async (id, status) =>
    apiRequest(`/waiter/orders/${id}/status`, { method: 'PUT', body: { status } }),
  createOrder: async (orderData) =>
    apiRequest('/waiter/orders', { method: 'POST', body: orderData }),

  completeOrder: async (orderId, tipAmount = null) =>
    rootRequest(`/orders/complete/${orderId}`, { method: 'PUT', body: tipAmount != null ? { tipAmount } : {} }),
};

// --------------------
// COMPATIBILITY EXPORTS
// --------------------
export const menuAPI = {
  getMenuItems: async () => {
    const r = await apiRequest('/menuitems');
    return Array.isArray(r) ? r : (r?.content ?? []);
  },
  getMenuItem: async (id) => apiRequest(`/menuitems/${id}`),
  createMenuItem: async (menuItem) => apiRequest('/menuitems', { method: 'POST', body: menuItem }),
  updateMenuItem: async (id, menuItem) => apiRequest(`/menuitems/${id}`, { method: 'PUT', body: menuItem }),
  deleteMenuItem: async (id) => apiRequest(`/menuitems/${id}`, { method: 'DELETE' }),
};

// ✅ FIXED: Orders endpoints are ROOT (/orders) not /api/orders. GET returns paginated { content, totalElements }.
export const ordersAPI = {
  createOrder: async (orderData) => rootRequest('/orders', { method: 'POST', body: orderData }),
  getOrders: async (page = 0, size = 20) => {
    const r = await rootRequest(`/orders?page=${page}&size=${size}`);
    return r?.content ?? r ?? [];
  },
  getOrder: async (id) => rootRequest(`/orders/${id}`),
  completeOrder: async (id) => rootRequest(`/orders/complete/${id}`, { method: 'PUT' }),
  deleteOrder: async (id) => rootRequest(`/orders/${id}`, { method: 'DELETE' }),
};

export const tablesAPI = {
  createTable: async (tableData) => apiRequest('/tables', { method: 'POST', body: tableData }),
  getTables: async () => apiRequest('/tables'),
  getTable: async (id) => apiRequest(`/tables/${id}`),
  deleteTable: async (id) => apiRequest(`/tables/${id}`, { method: 'DELETE' }),
};

export const reservationsAPI = {
  createReservation: async (data) => apiRequest('/reservations', { method: 'POST', body: data }),
  getReservations: async () => apiRequest('/reservations'),
  deleteReservation: async (id) => apiRequest(`/reservations/${id}`, { method: 'DELETE' }),
};

export const waitlistAPI = {
  join: (data) => apiRequest('/waitlist', { method: 'POST', body: data }),
  list: () => apiRequest('/waitlist'),
  notify: (id) => apiRequest(`/waitlist/${id}/notify`, { method: 'PUT' }),
  setStatus: (id, status) => apiRequest(`/waitlist/${id}/status`, { method: 'PUT', body: { status } }),
};

export const authAPI = {
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: data }),
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: data }),
  forgotPassword: (email) => apiRequest('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token, newPassword) => apiRequest('/auth/reset-password', { method: 'POST', body: { token, newPassword } }),
};

export const loyaltyAPI = {
  getBalance: (customerId) => apiRequest(`/loyalty/balance?customerId=${encodeURIComponent(customerId)}`),
  redeem: (customerId, points) => apiRequest('/loyalty/redeem', { method: 'POST', body: { customerId, points } }),
};

/** Get available tables for a date/time slot (90 min). Params: date=YYYY-MM-DD, time=HH:mm */
export const availabilityAPI = {
  getAvailability: (date, time) => apiRequest(`/availability?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`),
};

export const paymentsAPI = {
  createPayment: async (data) => apiRequest('/payments', { method: 'POST', body: data }),
  getPayments: async () => apiRequest('/payments'),
  getPayment: async (id) => apiRequest(`/payments/${id}`),
  completePayment: async (id) => apiRequest(`/payments/${id}/complete`, { method: 'PUT' }),
  createIntent: async (orderId) => apiRequest('/payments/create-intent', { method: 'POST', body: { orderId } }),
  config: async () => apiRequest('/payments/config'),
};

export const getReceiptUrl = (orderId) => `${API_ORIGIN}/orders/${orderId}/receipt`;

export const qrAPI = {
  getTableUrl: (tableIdOrNumber) => apiRequest(`/qr/table/${tableIdOrNumber}`),
};

export const reviewsAPI = {
  getReviews: (page = 0, size = 20) => apiRequest(`/reviews?page=${page}&size=${size}`),
  createReview: (data) => apiRequest('/reviews', { method: 'POST', body: data }),
};

export const apiKeysAPI = {
  create: (name) => apiRequest('/admin/api-keys', { method: 'POST', body: { name: name || 'API Key' } }),
  list: () => apiRequest('/admin/api-keys'),
  revoke: (id) => apiRequest(`/admin/api-keys/${id}`, { method: 'DELETE' }),
};

// Messages
export const messagesAPI = {
  send: (data) => apiRequest('/messages', { method: 'POST', body: data }),
  getAllAdmin: () => apiRequest('/admin/messages'),
};

// Optional analytics (only if backend exists)
export const analyticsAPI = {
  getDashboardStats: async () => apiRequest('/admin/dashboard/stats'),
  getRevenueData: async (period = 'weekly') => apiRequest(`/analytics/revenue?period=${period}`),
  getPopularItems: async () => apiRequest('/analytics/popular-items'),
};

export default apiRequest;
