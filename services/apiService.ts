// File: src/services/apiService.js
import { User } from '../types';

/**
 * ✅ Base URL configuration:
 * Uses environment variable (for Vercel deployment)
 * Falls back to localhost for local development.
 */
const API_BASE_URL =
  (process.env.REACT_APP_API_URL?.replace(/\/$/, '') || 'http://localhost:5000') + '/api';

/**
 * Retrieves the authentication token from localStorage.
 */
const getToken = () => localStorage.getItem('cleanconnect_token');

/**
 * Generic fetch wrapper for API requests.
 * Adds Authorization header if token exists.
 * Logs detailed errors for debugging.
 */
const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`📡 [API REQUEST] ${options.method || 'GET'} → ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Network or CORS failure
    if (!response) {
      throw new Error('No response from server');
    }

    // Response not OK
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {}
      throw new Error(
        errorData.message || `API Error: ${response.status} ${response.statusText}`
      );
    }

    // No content
    if (response.status === 204) return null;

    // Parse JSON
    return response.json();
  } catch (err) {
    console.error(`❌ [API ERROR] ${endpoint}:`, err.message);
    throw new Error(
      err.message.includes('Failed to fetch')
        ? 'Cannot reach the server. Please check your internet or try again shortly.'
        : err.message
    );
  }
};

// =====================
// Exported API service
// =====================
export const apiService = {
  // AUTH
  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => apiFetch('/auth/me'),

  // CLEANERS
  getAllCleaners: () => apiFetch('/cleaners'),
  getCleanerById: (id) => apiFetch(`/cleaners/${id}`),
  aiSearchCleaners: (query) =>
    apiFetch('/cleaners/ai-search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  // BOOKINGS
  createBooking: (bookingData) =>
    apiFetch('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),

  cancelBooking: (bookingId) =>
    apiFetch(`/bookings/${bookingId}/cancel`, { method: 'PUT' }),

  markJobComplete: (bookingId) =>
    apiFetch(`/bookings/${bookingId}/complete`, { method: 'POST' }),

  submitReview: (bookingId, reviewData) =>
    apiFetch(`/bookings/${bookingId}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),

  // USER PROFILE
  updateUser: (userData) =>
    apiFetch('/users/profile', { method: 'PUT', body: JSON.stringify(userData) }),

  submitContactForm: (formData) =>
    apiFetch('/contact', { method: 'POST', body: JSON.stringify(formData) }),

  // RECEIPTS & SUBSCRIPTIONS
  uploadReceipt: (entityId, receiptData, type) => {
    const endpoint =
      type === 'booking'
        ? `/bookings/${entityId}/receipt`
        : `/users/subscription/receipt`;
    return apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({ receipt: receiptData }),
    });
  },

  requestSubscriptionUpgrade: (plan) =>
    apiFetch('/users/subscription/request-upgrade', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    }),

  // ADMIN ACTIONS
  adminGetAllUsers: () => apiFetch('/admin/users'),

  adminUpdateUserStatus: (userId, isSuspended) =>
    apiFetch(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isSuspended }),
    }),

  adminDeleteUser: (userId) =>
    apiFetch(`/admin/users/${userId}`, { method: 'DELETE' }),

  adminConfirmPayment: (bookingId) =>
    apiFetch('/admin/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    }),

  adminApproveSubscription: (userId) =>
    apiFetch('/admin/subscriptions/approve', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  adminMarkAsPaid: (bookingId) =>
    apiFetch('/admin/payments/mark-paid', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    }),
};
