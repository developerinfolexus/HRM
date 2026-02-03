import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL;

// If env var is missing, determine based on hostname
if (!API_URL) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        API_URL = 'http://localhost:5000/api';
    } else {
        // Fallback for production if env var is missing
        API_URL = 'https://hrm-backend-b3sz.onrender.com/api';
    }
}

// Normalize URL to ensure it ends with /api
if (!API_URL.endsWith('/api')) {
    API_URL += '/api';
}

const api = axios.create({
    baseURL: API_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Auto logout on 401 (Unauthorized), but SKIP if we are already trying to login
            // to avoid reloading the page when user enters wrong credentials.
            if (!error.config.url.includes('/login')) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
