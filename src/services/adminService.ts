import axios from '@/config/axios';
import { AdminStatsDTO, AdminUserDTO, PageResponse } from '@/types/admin';

export const adminService = {
  /** Lấy thống kê tổng quan hệ thống */
  getStats: async (): Promise<AdminStatsDTO> => {
    const res = await axios.get('/admin/stats');
    return res.data.data;
  },

  /** Danh sách người dùng (có phân trang + tìm kiếm) */
  getUsers: async (params?: {
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<AdminUserDTO>> => {
    const res = await axios.get('/admin/users', { params });
    return res.data.data;
  },

  /** Đổi role người dùng */
  updateUserRole: async (userId: string, role: string): Promise<AdminUserDTO> => {
    const res = await axios.put(`/admin/users/${userId}/role`, { role });
    return res.data.data;
  },

  /** Xóa người dùng */
  deleteUser: async (userId: string): Promise<void> => {
    await axios.delete(`/admin/users/${userId}`);
  },
};

export default adminService;
