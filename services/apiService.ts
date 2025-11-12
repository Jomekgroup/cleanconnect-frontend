import { User } from '../types';

// Use environment variable if available, otherwise fallback to localhost for dev
const RENDER_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/";
const API_BASE_URL = `${RENDER_URL.replace(/\/$/, '')}/api`;

/**
 * Retrieves the authentication token from localStorage.
 */
const getToken = (): string | null => localStorage.getItem('cleanconnect_token');

/**
 * Wrapper around fetch API to handle requests and Authorization header
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
    // AUTH
    login: async (email: string, password?: string): Promise<{ token: string; user: User }> =>
        apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: async (userData: Partial<User>): Promise<User> =>
        apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),

    getMe: async (): Promise<User> => apiFetch('/auth/me'),

    // PUBLIC
    getAllCleaners: async () => apiFetch('/cleaners'),
    getCleanerById: async (id: string) => apiFetch(`/cleaners/${id}`),
    aiSearchCleaners: async (query: string): Promise<{ matchingIds: string[] }> =>
        apiFetch('/cleaners/ai-search', {
            method: 'POST',
            body: JSON.stringify({ query }),
        }),

    // BOOKINGS & USER ACTIONS
    createBooking: async (bookingData: any) => apiFetch('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),
    cancelBooking: async (bookingId: string) => apiFetch(`/bookings/${bookingId}/cancel`, { method: 'PUT' }),
    markJobComplete: async (bookingId: string) => apiFetch(`/bookings/${bookingId}/complete`, { method: 'POST' }),
    submitReview: async (bookingId: string, reviewData: any) =>
        apiFetch(`/bookings/${bookingId}/review`, { method: 'POST', body: JSON.stringify(reviewData) }),
    updateUser: async (userData: Partial<User>) =>
        apiFetch(`/users/profile`, { method: 'PUT', body: JSON.stringify(userData) }),
    submitContactForm: async (formData: any) => apiFetch('/contact', { method: 'POST', body: JSON.stringify(formData) }),
    uploadReceipt: async (entityId: string, receiptData: any, type: 'booking' | 'subscription') => {
        const endpoint = type === 'booking' ? `/bookings/${entityId}/receipt` : `/users/subscription/receipt`;
        return apiFetch(endpoint, { method: 'POST', body: JSON.stringify({ receipt: receiptData }) });
    },
    requestSubscriptionUpgrade: async (plan: any) =>
        apiFetch('/users/subscription/request-upgrade', { method: 'POST', body: JSON.stringify({ plan }) }),

    // ADMIN
    adminGetAllUsers: async (): Promise<User[]> => apiFetch('/admin/users'),
    adminUpdateUserStatus: async (userId: string, isSuspended: boolean) =>
        apiFetch(`/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ isSuspended }) }),
    adminDeleteUser: async (userId: string) => apiFetch(`/users/${userId}`, { method: 'DELETE' }),
    adminConfirmPayment: async (bookingId: string) =>
        apiFetch('/admin/payments/confirm', { method: 'POST', body: JSON.stringify({ bookingId }) }),
    adminApproveSubscription: async (userId: string) =>
        apiFetch('/admin/subscriptions/approve', { method: 'POST', body: JSON.stringify({ userId }) }),
    adminMarkAsPaid: async (bookingId: string) =>
        apiFetch('/admin/payments/mark-paid', { method: 'POST', body: JSON.stringify({ bookingId }) }),
};
