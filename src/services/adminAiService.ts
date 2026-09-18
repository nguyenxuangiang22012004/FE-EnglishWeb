import axios from '@/config/axios';
import {
  AdminAiKeyDTO,
  AdminAiStatsDTO,
  AiKeyTestResponse,
  CreateAdminAiKeyRequest,
  UpdateAdminAiKeyRequest,
} from '@/types/aiSettings';

export const adminAiService = {
  /**
   * Lấy danh sách toàn bộ Admin API Keys
   */
  getAllKeys: async (): Promise<AdminAiKeyDTO[]> => {
    const res = await axios.get('/admin/ai-settings/keys');
    return res.data?.data || [];
  },

  /**
   * Thêm mới 1 Admin API Key
   */
  createKey: async (payload: CreateAdminAiKeyRequest): Promise<AdminAiKeyDTO> => {
    const res = await axios.post('/admin/ai-settings/keys', payload);
    return res.data?.data;
  },

  /**
   * Cập nhật Admin API Key
   */
  updateKey: async (id: string, payload: UpdateAdminAiKeyRequest): Promise<AdminAiKeyDTO> => {
    const res = await axios.put(`/admin/ai-settings/keys/${id}`, payload);
    return res.data?.data;
  },

  /**
   * Xóa Admin API Key
   */
  deleteKey: async (id: string): Promise<void> => {
    await axios.delete(`/admin/ai-settings/keys/${id}`);
  },

  /**
   * Bật / Tắt trạng thái Admin API Key
   */
  toggleKeyStatus: async (id: string): Promise<AdminAiKeyDTO> => {
    const res = await axios.patch(`/admin/ai-settings/keys/${id}/toggle`);
    return res.data?.data;
  },

  /**
   * Test API Key với Google Gemini (truyền trực tiếp key string)
   */
  testKey: async (apiKey: string, model = 'gemini-2.5-flash'): Promise<AiKeyTestResponse> => {
    const res = await axios.post('/admin/ai-settings/test-key', { apiKey }, { params: { model } });
    return res.data?.data;
  },

  /**
   * Test Admin API Key đã lưu trong Database bằng ID (Backend tự giải mã và test)
   */
  testKeyById: async (id: string, model = 'gemini-2.5-flash'): Promise<AiKeyTestResponse> => {
    const res = await axios.post(`/admin/ai-settings/keys/${id}/test`, null, { params: { model } });
    return res.data?.data;
  },

  /**
   * Lấy thống kê hệ thống AI & Quota Dùng thử
   */
  getStats: async (): Promise<AdminAiStatsDTO> => {
    const res = await axios.get('/admin/ai-settings/stats');
    return res.data?.data;
  },
};

export default adminAiService;
