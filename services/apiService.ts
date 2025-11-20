// File: src/services/apiService.ts

/**
 * ✅ Base URL configuration:
 * Uses Vite environment variable (for Vercel deployment)
 * Falls back to localhost for local development.
 * * NOTE: Ensure Vercel Environment Variable is named VITE_API_URL
 */
const API_BASE_URL = 
  (import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000') + '/api';

/**
 * Retrieves the authentication token from localStorage.
 */
const getToken = (): string | null => localStorage.getItem('cleanconnect_token');

/**
 * Generic fetch wrapper for API requests.
 * Adds Authorization header if token exists.
 * Logs detailed errors for debugging.
 */
const apiFetch = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();

  const headers: HeadersInit = {
    ...options.headers,
  };

  // Add Authorization Token if available
  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  // NOTE: We do NOT set 'Content-Type' if body is FormData. 
  // The browser sets it automatically with the correct boundary.

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

    // Handle 204 No Content (Successful delete/update with no body)
    if (response.status === 204) return null as any;

    // Handle Errors
    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // Response wasn't JSON
      }
      
      const errorMessage = errorData.message || errorData.error || `API Error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (err: any) {
    console.error(`❌ [API ERROR] ${endpoint}:`, err.message);
    
    // User-friendly network error
    const isNetworkError = err.message.includes('Failed to fetch') || err.message.includes('Network request failed');
    
    throw new Error(
        isNetworkError
        ? 'Cannot reach the server. Please check your internet connection.'
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
      body: formData, // ✅ FormData handles headers automatically
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
    apiFetch('/bookings', { 
        method: 'POST', 
        body: JSON.stringify(bookingData), 
        headers: { 'Content-Type': 'application/json' } 
    }),

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
    apiFetch('/users/profile', { 
        method: 'PUT', 
        body: JSON.stringify(userData), 
        headers: { 'Content-Type': 'application/json' } 
    }),

  submitContactForm: (formData: any) =>
    apiFetch('/contact', { 
        method: 'POST', 
        body: JSON.stringify(formData), 
        headers: { 'Content-Type': 'application/json' } 
    }),

  // =====================
  // RECEIPTS & SUBSCRIPTIONS
  // =====================
  /**
   * Uploads a receipt image/pdf.
   * Expects a FormData object containing a field named 'receipt' (the file).
   */
  uploadReceipt: (entityId: string | number, receiptFormData: FormData, type: 'booking' | 'subscription') => {
    const endpoint =
      type === 'booking'
        ? `/bookings/${entityId}/receipt`
        : `/users/subscription/receipt`;
    
    return apiFetch(endpoint, {
      method: 'POST',
      body: receiptFormData, // ✅ FIXED: Uses FormData for file upload
      // Do NOT set Content-Type header here
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