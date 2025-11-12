
import { User } from '../types';

// Hardcoded localhost URL to ensure local preview functionality.
// This will need to be changed back to use environment variables for a live production deployment.
const API_BASE_URL = "http://localhost:5000/api";


/**
 * Retrieves the authentication token from localStorage.
 */
const getToken = (): string | null => localStorage.getItem('cleanconnect_token');

/**
 * A wrapper around the native fetch API to handle API requests,
 * including adding the Authorization header for protected routes.
 * @param endpoint - The API endpoint to call (e.g., '/auth/login').
 * @param options - The native fetch options object (e.g., method, body).
 * @returns The JSON response from the API.
 * @throws An error if the API response is not ok.
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

    // Handle responses that might not have a body (e.g., 204 No Content)
    if (response.status === 204) {
        return null;
    }

    return response.json();
};

export const apiService = {
    // ===================================
    // AUTHENTICATION
    // ===================================
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

    // ===================================
    // PUBLIC DATA
    // ===================================
    getAllCleaners: async () => {
        return apiFetch('/cleaners');
    },

    getCleanerById: async (id: string) => {
        return apiFetch(`/cleaners/${id}`);
    },

    aiSearchCleaners: async (query: string): Promise<{ matchingIds: string[] }> => {
        return apiFetch('/cleaners/ai-search', {
            method: 'POST',
            body: JSON.stringify({ query }),
        });
    },
    
    // ===================================
    // USER ACTIONS (CLIENTS & CLEANERS)
    // ===================================
    createBooking: async (bookingData: any) => {
        return apiFetch('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData),
        });
    },

    cancelBooking: async (bookingId: string) => {
        return apiFetch(`/bookings/${bookingId}/cancel`, {
            method: 'PUT',
        });
    },

    markJobComplete: async (bookingId: string) => {
         return apiFetch(`/bookings/${bookingId}/complete`, {
            method: 'POST',
        });
    },

    submitReview: async (bookingId: string, reviewData: any) => {
         return apiFetch(`/bookings/${bookingId}/review`, {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    },
    
    updateUser: async (userData: Partial<User>) => {
        return apiFetch(`/users/profile`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    },

    submitContactForm: async (formData: any) => {
        return apiFetch('/contact', {
            method: 'POST',
            body: JSON.stringify(formData),
        });
    },
    
    uploadReceipt: async (entityId: string, receiptData: any, type: 'booking' | 'subscription') => {
        // The backend needs to distinguish between booking and subscription receipts.
        const endpoint = type === 'booking' ? `/bookings/${entityId}/receipt` : `/users/subscription/receipt`;
        return apiFetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({ receipt: receiptData }), // Sending base64 data
        });
    },

    requestSubscriptionUpgrade: async (plan: any) => {
        return apiFetch('/users/subscription/request-upgrade', {
            method: 'POST',
            body: JSON.stringify({ plan }),
        });
    },

    // ===================================
    // ADMIN ACTIONS
    // ===================================
    adminGetAllUsers: async (): Promise<User[]> => {
         return apiFetch('/admin/users');
    },
    
    adminUpdateUserStatus: async (userId: string, isSuspended: boolean) => {
        return apiFetch(`/users/${userId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ isSuspended }),
        });
    },

    adminDeleteUser: async (userId: string) => {
        return apiFetch(`/users/${userId}`, {
            method: 'DELETE',
        });
    },

    adminConfirmPayment: async (bookingId: string) => {
        return apiFetch('/admin/payments/confirm', {
            method: 'POST',
            body: JSON.stringify({ bookingId }),
        });
    },

    adminApproveSubscription: async (userId: string) => {
        return apiFetch('/admin/subscriptions/approve', {
            method: 'POST',
            body: JSON.stringify({ userId }),
        });
    },

    adminMarkAsPaid: async (bookingId: string) => {
        return apiFetch('/admin/payments/mark-paid', {
            method: 'POST',
            body: JSON.stringify({ bookingId }),
        });
    },
};