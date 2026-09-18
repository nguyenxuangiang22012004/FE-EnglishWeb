import axios from '@/config/axios';
import { getOrCreateDeviceId, markFeatureTrialExhausted } from '@/utils/deviceFingerprint';
import { TrialConsumeResponse, UserAiSettingDTO } from '@/types/aiSettings';

export const aiConfigService = {
  /**
   * Lấy cấu hình AI và API Key cá nhân của người dùng
   */
  getMyAiSetting: async (): Promise<UserAiSettingDTO> => {
    try {
      const response = await axios.get('/ai-config/my-key');
      return response.data?.data || {
        hasApiKey: false,
        maskedApiKey: null,
        preferredModel: 'gemini-2.5-flash',
        apiKey: null,
        updatedAt: null,
      };
    } catch (err) {
      console.warn('Không thể lấy cài đặt AI từ server:', err);
      return {
        hasApiKey: false,
        maskedApiKey: null,
        preferredModel: 'gemini-2.5-flash',
        apiKey: null,
        updatedAt: null,
      };
    }
  },

  /**
   * Lưu hoặc cập nhật API Key cá nhân của người dùng
   */
  saveMyAiSetting: async (apiKey: string, preferredModel = 'gemini-2.5-flash'): Promise<UserAiSettingDTO> => {
    const response = await axios.post('/ai-config/my-key', {
      apiKey: apiKey.trim(),
      preferredModel,
    });
    return response.data?.data;
  },

  /**
   * Xóa API Key cá nhân của người dùng
   */
  deleteMyAiSetting: async (): Promise<void> => {
    await axios.delete('/ai-config/my-key');
  },

  /**
   * Yêu cầu tiêu thụ 1 lượt prompt dùng thử (Trial Quota)
   */
  consumeTrialPrompt: async (featureName: string): Promise<TrialConsumeResponse> => {
    const deviceId = getOrCreateDeviceId();
    try {
      const response = await axios.post('/ai-config/trial/consume', {
        featureName,
        deviceId,
      });
      const data: TrialConsumeResponse = response.data?.data;

      if (data && data.remainingTrialCount <= 0) {
        markFeatureTrialExhausted(featureName);
      }

      return data;
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.data?.data?.allowed === false) {
        markFeatureTrialExhausted(featureName);
        throw new Error(
          err.response?.data?.message ||
          'Bạn đã dùng hết 2 lượt dùng thử miễn phí cho tính năng này. Vui lòng thêm Gemini API Key cá nhân trong Cài đặt (⚙️) để tiếp tục không giới hạn!'
        );
      }
      throw err;
    }
  },

  /**
   * Lấy số lượt dùng thử còn lại của một tính năng
   */
  getRemainingTrial: async (featureName: string): Promise<number> => {
    const deviceId = getOrCreateDeviceId();
    try {
      const response = await axios.get('/ai-config/trial/remaining', {
        params: { featureName, deviceId },
      });
      return response.data?.data ?? 2;
    } catch (err) {
      return 2;
    }
  },
};

export default aiConfigService;
