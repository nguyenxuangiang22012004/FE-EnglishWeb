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

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return instance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        isRefreshing = false;
        // Handle unauthorized or forbidden (token expired/invalid)
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        store.dispatch(logout());
        
        // Force redirect to login page
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          // Only redirect if not already on the login page to avoid infinite loops
          if (!currentPath.includes('/auth/login')) {
            window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
          refreshToken: refreshToken,
        });
        
        if (res.data?.success && res.data?.data?.accessToken) {
          const newToken = res.data.data.accessToken;
          localStorage.setItem('token', newToken);
          if (res.data.data.refreshToken) {
            localStorage.setItem('refreshToken', res.data.data.refreshToken);
          }
          
          instance.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
          
          processQueue(null, newToken);
          return instance(originalRequest);
        } else {
            throw new Error('Refresh token response invalid');
        }
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        store.dispatch(logout());
        
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/auth/login')) {
            window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance;
