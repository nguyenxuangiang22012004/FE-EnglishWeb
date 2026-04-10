import axios from '@/config/axios';
import { Lesson, Quiz } from '@/types/index';

// User Service
export const userService = {
  getUserProfile: async (userId: string) => {
    const response = await axios.get(`/users/${userId}`);
    return response.data;
  },

  updateProfile: async (userId: string, data: any) => {
    const response = await axios.put(`/users/${userId}`, data);
    return response.data;
  },

  getLessons: async (params?: { page?: number; limit?: number }) => {
    const response = await axios.get('/users/lessons', { params });
    return response.data;
  },

  getUserProgress: async (userId: string) => {
    const response = await axios.get(`/users/${userId}/progress`);
    return response.data;
  },
};

export default userService;
