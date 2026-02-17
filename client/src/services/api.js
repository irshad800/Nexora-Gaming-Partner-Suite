import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base URL
const api = axios.create({
    baseURL: '/api', // Vite proxy handles the rest
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: Attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: Handle errors globally
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const message = error.response?.data?.message || 'Something went wrong';

        // Handle session expiry (401)
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Optional: Redirect to login or dispatch logout action
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
                toast.error('Session expired. Please login again.');
            }
        } else {
            // Don't show toast for 404s or specific handled errors if needed
            if (error.response?.status !== 404) {
                toast.error(message);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
