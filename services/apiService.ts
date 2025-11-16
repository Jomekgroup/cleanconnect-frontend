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
const apiFetch = async (endpoint, options: any = {}) => {
  const token = getToken();

  const headers: any = {
    ...options.headers,
  };

  // Only add Authorization; content-type is handled automatically for FormData
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

    if (!response) {
      throw new Error('No response from server');
    }

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {}
      throw new Error(
        errorData.message || `API Error: ${response.status} ${response.statusText}`
      );
    }

    if (response.status === 204) return null;

    return response.json();
  } catch (err: any) {
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
  // =====================
  // AUTH
  // =====================
  login: (email: string, password: string) =>
    apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),

  register: (formData: FormData) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: formData, // FormData handles files
    }),

  getMe: () => apiFetch('/auth/me'),

  // =====================
  // CLEANERS
  // =====================
  getAllCleaners: () => apiFetch('/cleaners'),
  getCleanerById: (id: string | number) => apiFetch(`/cleaners/${id}`),
  aiSearchCleaners: (query: string) =>
    apiFetch('/cleaners/ai-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }),

  // =====================
  // BOOKINGS
  // =====================
  createBooking: (bookingData: any) =>
    apiFetch('/bookings', { method: 'POST', body: JSON.stringify(bookingData), headers: { 'Content-Type': 'application/json' } }),

  cancelBooking: (bookingId: string | number) =>
    apiFetch(`/bookings/${bookingId}/cancel`, { method: 'PUT' }),

  markJobComplete: (bookingId: string | number) =>
    apiFetch(`/bookings/${bookingId}/complete`, { method: 'POST' }),

  submitReview: (bookingId: string | number, reviewData: any) =>
    apiFetch(`/bookings/${bookingId}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
      headers: { 'Content-Type': 'application/json' },
    }),

  // =====================
  // USER PROFILE
  // =====================
  updateUser: (userData: any) =>
    apiFetch('/users/profile', { method: 'PUT', body: JSON.stringify(userData), headers: { 'Content-Type': 'application/json' } }),

  submitContactForm: (formData: any) =>
    apiFetch('/contact', { method: 'POST', body: JSON.stringify(formData), headers: { 'Content-Type': 'application/json' } }),

  // =====================
  // RECEIPTS & SUBSCRIPTIONS
  // =====================
  uploadReceipt: (entityId: string | number, receiptData: any, type: string) => {
    const endpoint =
      type === 'booking'
        ? `/bookings/${entityId}/receipt`
        : `/users/subscription/receipt`;
    return apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({ receipt: receiptData }),
      headers: { 'Content-Type': 'application/json' },
    });
  },

  requestSubscriptionUpgrade: (plan: string) =>
    apiFetch('/users/subscription/request-upgrade', {
      method: 'POST',
      body: JSON.stringify({ plan }),
      headers: { 'Content-Type': 'application/json' },
    }),

  // =====================
  // ADMIN ACTIONS
  // =====================
  adminGetAllUsers: () => apiFetch('/admin/users'),

  adminUpdateUserStatus: (userId: string | number, isSuspended: boolean) =>
    apiFetch(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isSuspended }),
      headers: { 'Content-Type': 'application/json' },
    }),

  adminDeleteUser: (userId: string | number) =>
    apiFetch(`/admin/users/${userId}`, { method: 'DELETE' }),

  adminConfirmPayment: (bookingId: string | number) =>
    apiFetch('/admin/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
      headers: { 'Content-Type': 'application/json' },
    }),

  adminApproveSubscription: (userId: string | number) =>
    apiFetch('/admin/subscriptions/approve', {
      method: 'POST',
      body: JSON.stringify({ userId }),
      headers: { 'Content-Type': 'application/json' },
    }),

  adminMarkAsPaid: (bookingId: string | number) =>
    apiFetch('/admin/payments/mark-paid', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
      headers: { 'Content-Type': 'application/json' },
    }),
};
