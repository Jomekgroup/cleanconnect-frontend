import { User } from '../types';

/**
 * Base URL configuration:
 * Uses environment variable if available (for Vercel deployment)
 * Falls back to localhost for local development.
 */
const API_BASE_URL = `${
  process.env.REACT_APP_API_URL?.replace(/\/$/, '') || 'http://localhost:5000'
}/api`;

/**
 * Retrieves the authentication token from localStorage.
 */
const getToken = (): string | null => localStorage.getItem('cleanconnect_token');

/**
 * Generic fetch wrapper for API requests.
 * Adds Authorization header if token exists.
 */
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    throw new Error(errorData.message || 'An unknown API error occurred');
  }

  if (response.status === 204) return null;
  return response.json();
};

export const apiService = {
  // =====================
  // AUTH
  // =====================
  login: async (email: string, password?: string): Promise<{ token: string; user: User }> => {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData: Partial<User>): Promise<User> => {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getMe: async (): Promise<User> => {
    return apiFetch('/auth/me');
  },

  // =====================
  // CLEANERS
  // =====================
  getAllCleaners: async () => apiFetch('/cleaners'),
  getCleanerById: async (id: string) => apiFetch(`/cleaners/${id}`),
  aiSearchCleaners: async (query: string) =>
    apiFetch('/cleaners/ai-search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  // =====================
  // BOOKINGS
  // =====================
  createBooking: async (bookingData: any) =>
    apiFetch('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),

  cancelBooking: async (bookingId: string) =>
    apiFetch(`/bookings/${bookingId}/cancel`, { method: 'PUT' }),

  markJobComplete: async (bookingId: string) =>
    apiFetch(`/bookings/${bookingId}/complete`, { method: 'POST' }),

  submitReview: async (bookingId: string, reviewData: any) =>
    apiFetch(`/bookings/${bookingId}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),

  // =====================
  // USER PROFILE
  // =====================
  updateUser: async (userData: Partial<User>) =>
    apiFetch('/users/profile', { method: 'PUT', body: JSON.stringify(userData) }),

  submitContactForm: async (formData: any) =>
    apiFetch('/contact', { method: 'POST', body: JSON.stringify(formData) }),

  // =====================
  // RECEIPTS & SUBSCRIPTIONS
  // =====================
  uploadReceipt: async (entityId: string, receiptData: any, type: 'booking' | 'subscription') => {
    const endpoint =
      type === 'booking'
        ? `/bookings/${entityId}/receipt`
        : `/users/subscription/receipt`;
    return apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({ receipt: receiptData }),
    });
  },

  requestSubscriptionUpgrade: async (plan: any) =>
    apiFetch('/users/subscription/request-upgrade', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    }),

  // =====================
  // ADMIN ACTIONS
  // =====================
  adminGetAllUsers: async (): Promise<User[]> => apiFetch('/admin/users'),

  adminUpdateUserStatus: async (userId: string, isSuspended: boolean) =>
    apiFetch(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isSuspended }),
    }),

  adminDeleteUser: async (userId: string) =>
    apiFetch(`/admin/users/${userId}`, { method: 'DELETE' }),

  adminConfirmPayment: async (bookingId: string) =>
    apiFetch('/admin/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    }),

  adminApproveSubscription: async (userId: string) =>
    apiFetch('/admin/subscriptions/approve', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  adminMarkAsPaid: async (bookingId: string) =>
    apiFetch('/admin/payments/mark-paid', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    }),
};
