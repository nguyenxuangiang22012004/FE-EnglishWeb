import axios from '@/config/axios';
import { AuthCredentials, AuthResponse, RegisterPayload } from '@/types/auth';

// Helper: lưu token vào cookie để Next.js middleware đọc được (server-side)
function saveTokenToCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeTokenCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// Auth Service
export const authService = {
  login: async (credentials: AuthCredentials): Promise<AuthResponse> => {
    const response = await axios.post('/auth/login', credentials);
    // Lưu token vào cookie để Next.js middleware đọc được
    if (response.data?.data?.accessToken) {
      saveTokenToCookie('token', response.data.data.accessToken);
    }
    return response.data;
  },

  loginWithGoogle: async (idToken: string): Promise<AuthResponse> => {
    const response = await axios.post('/auth/google', { idToken });
    // Lưu token vào cookie như login thông thường
    if (response.data?.data?.accessToken) {
      saveTokenToCookie('token', response.data.data.accessToken);
    }
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await axios.post('/auth/register', payload);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    removeTokenCookie('token');
    removeTokenCookie('refreshToken');
  },

  getProfile: async () => {
    const response = await axios.get('/auth/profile');
    return response.data;
  },
};

export default authService;
