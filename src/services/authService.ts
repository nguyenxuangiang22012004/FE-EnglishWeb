import axios from '@/config/axios';
import { AuthCredentials, AuthResponse, RegisterPayload } from '@/types/auth';

// Auth Service
export const authService = {
  login: async (credentials: AuthCredentials): Promise<AuthResponse> => {
    const response = await axios.post('/auth/login', credentials);
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await axios.post('/auth/register', payload);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
  },

  getProfile: async () => {
    const response = await axios.get('/auth/profile');
    return response.data;
  },
};

export default authService;
