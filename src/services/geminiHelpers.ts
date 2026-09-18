/**
 * Shared Gemini API Helpers with AI Model Fallback Chain & Dual API Key Management.
 * Hỗ trợ:
 * 1. User API Key cá nhân (không giới hạn lượt)
 * 2. Admin API Key dùng thử (tối đa 2 lượt/tính năng kèm chống gian lận)
 * 3. Tự động xoay tua danh sách mô hình AI khi bị lỗi 429/503/404/Quota
 */

import { aiConfigService } from './aiConfigService';
import { isFeatureTrialExhaustedLocal } from '@/utils/deviceFingerprint';

// Thứ tự xoay tua mô hình AI ưu tiên cao nhất
export const MODEL_ROTATION_CHAIN = [
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-3-flash',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

export function getLocalGeminiKey(): string {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('gemini_api_key') ||
    localStorage.getItem('geminiKey') ||
    ''
  );
}

export const getGeminiKey = getLocalGeminiKey;

export function getGeminiModel(): string {
  if (typeof window === 'undefined') return 'gemini-2.5-flash';
  let model = localStorage.getItem('gemini_model_id') || 'gemini-2.5-flash';
  
  if (model.includes('-tts') || model.includes('tts')) {
    model = 'gemini-2.5-flash';
  }
  return model;
}

export interface GeminiCallOptions {
  featureName?: string; // Tên tính năng để theo dõi quota: 'ai-listening', 'ai-writing', 'ai-conversation', 'ai-lookup', 'ai-import'
  maxOutputTokens?: number;
  temperature?: number;
  thinkingBudget?: number;
  systemInstruction?: string;
  signal?: AbortSignal;
}

export interface ResolvedAiCredentials {
  apiKey: string;
  model: string;
  isTrial: boolean;
  remainingTrialCount?: number;
}

/**
 * Lấy API Key và Model phù hợp:
 * - Nếu user đã cấu hình key cá nhân -> dùng ngay
 * - Nếu chưa có key cá nhân -> kiểm tra và trừ quota dùng thử (2 lần/tính năng) từ Admin Key pool
 */
export async function resolveGeminiCredentials(featureName = 'ai-general'): Promise<ResolvedAiCredentials> {
  const userKey = getLocalGeminiKey();
  if (userKey && userKey.trim().length > 5) {
    return {
      apiKey: userKey.trim(),
      model: getGeminiModel(),
      isTrial: false,
    };
  }

  // Kiểm tra cờ hết lượt nhanh trên client
  if (isFeatureTrialExhaustedLocal(featureName)) {
    throw new Error(
      `Bạn đã hết 2 lượt dùng thử cho tính năng này. Vui lòng nhập Gemini API Key của bạn trong Cài đặt (⚙️) để tiếp tục không giới hạn!`
    );
  }

  // Tiêu thụ lượt dùng thử từ Backend
  try {
    const trialRes = await aiConfigService.consumeTrialPrompt(featureName);
    if (!trialRes.allowed || !trialRes.trialApiKey) {
      throw new Error(
        trialRes.message ||
        `Bạn đã dùng hết 2 lượt dùng thử cho tính năng này. Vui lòng thêm Gemini API Key trong Cài đặt (⚙️).`
      );
    }

    // Bắn event để UI cập nhật số lượt còn lại
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ai-trial-updated', {
          detail: {
            featureName,
            remainingTrialCount: trialRes.remainingTrialCount,
          },
        })
      );
    }

    return {
      apiKey: trialRes.trialApiKey,
      model: trialRes.preferredModel || 'gemini-2.5-flash',
      isTrial: true,
      remainingTrialCount: trialRes.remainingTrialCount,
    };
  } catch (err: any) {
    throw new Error(
      err.message || 'Không thể cấp quyền dùng thử. Vui lòng thêm Gemini API Key trong Cài đặt (⚙️).'
    );
  }
}

/**
 * Gọi Gemini API với cơ chế tự động xoay tua mô hình (Model Fallback Rotation) và parse JSON
 */
export async function callGeminiJSON<T>(
  prompt: string,
  optionsOrSignal?: GeminiCallOptions | AbortSignal,
  signal?: AbortSignal,
): Promise<T> {
  let options: GeminiCallOptions | undefined;
  let activeSignal: AbortSignal | undefined = signal;

  if (optionsOrSignal instanceof AbortSignal) {
    activeSignal = optionsOrSignal;
  } else if (optionsOrSignal) {
    options = optionsOrSignal;
    if (options.signal) {
      activeSignal = options.signal;
    }
  }

  const featureName = options?.featureName || 'ai-general';
  const credentials = await resolveGeminiCredentials(featureName);
  const key = credentials.apiKey;

  let currentModel = credentials.model || getGeminiModel();
  const temperature = options?.temperature ?? 0.1;
  const maxOutputTokens = options?.maxOutputTokens ?? 8192;
  const thinkingBudget = options?.thinkingBudget !== undefined ? options.thinkingBudget : 0;

  const generationConfig: Record<string, unknown> = {
    temperature,
    maxOutputTokens,
    responseMimeType: 'application/json',
  };

  if (thinkingBudget !== undefined) {
    generationConfig.thinkingConfig = {
      thinkingBudget,
    };
  }

  const requestBody: Record<string, unknown> = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig,
  };

  if (options?.systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: options.systemInstruction }],
    };
  }

  // Xây dựng danh sách model xoay tua (Bắt đầu từ model hiện tại, sau đó qua các model trong chuỗi fallback)
  const modelsToTry = [
    currentModel,
    ...MODEL_ROTATION_CHAIN.filter((m) => m !== currentModel),
  ];

  let lastError: Error | null = null;
  let successRes: Response | null = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: activeSignal,
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        successRes = res;
        break;
      }

      const errData = await res.clone().json().catch(() => ({}));
      const errMsg = (errData as { error?: { message?: string } })?.error?.message || `HTTP ${res.status}`;
      
      const isRetryable =
        res.status === 429 ||
        res.status === 503 ||
        res.status === 500 ||
        res.status === 404 ||
        res.status === 400 ||
        errMsg.toLowerCase().includes('quota') ||
        errMsg.toLowerCase().includes('high demand') ||
        errMsg.toLowerCase().includes('overloaded') ||
        errMsg.toLowerCase().includes('not found') ||
        errMsg.toLowerCase().includes('not supported') ||
        errMsg.toLowerCase().includes('resource_exhausted');

      if (isRetryable && i < modelsToTry.length - 1) {
        console.warn(`[AI Fallback] Model ${model} gặp lỗi (${errMsg}). Tự động xoay tua sang ${modelsToTry[i + 1]}...`);
        await new Promise((resolve) => setTimeout(resolve, 600));
        continue;
      }

      lastError = new Error(`Gemini API lỗi (${model}): ${errMsg}`);
    } catch (fetchErr: any) {
      if (fetchErr.name === 'AbortError') {
        throw fetchErr;
      }
      if (i < modelsToTry.length - 1) {
        console.warn(`[AI Fallback] Lỗi mạng khi gọi ${model}: ${fetchErr.message}. Thử model kế tiếp...`);
        await new Promise((resolve) => setTimeout(resolve, 600));
        continue;
      }
      lastError = fetchErr;
    }
  }

  if (!successRes) {
    throw lastError || new Error('Không thể kết nối đến các mô hình AI của Google Gemini. Vui lòng thử lại sau.');
  }

  const data = await successRes.json();
  let raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  raw = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    raw = raw.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    try {
      const sanitized = raw
        .replace(/,\s*([\]}])/g, '$1')
        .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
      return JSON.parse(sanitized) as T;
    } catch {
      console.error('Lỗi parse JSON từ Gemini. Raw content:', raw);
      throw new Error('Gemini trả về dữ liệu JSON không hợp lệ. Vui lòng thử lại.');
    }
  }
}
