import axios from 'axios';
import store from '@/store';
import { logout } from '@/store/slices/authSlice';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Handle unauthorized or forbidden (token expired/invalid)
      localStorage.removeItem('token');
      store.dispatch(logout());
      
      // Force redirect to login page
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        // Only redirect if not already on the login page to avoid infinite loops
        if (!currentPath.includes('/auth/login')) {
          window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
