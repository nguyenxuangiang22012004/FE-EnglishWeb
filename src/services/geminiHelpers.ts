/**
 * Shared Gemini API helpers.
 * Extracts common logic (key retrieval, model selection, API call)
 * so multiple features can reuse them without duplication.
 */

export function getGeminiKey(): string {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('gemini_api_key') ||
    localStorage.getItem('geminiKey') ||
    ''
  );
}

export function getGeminiModel(): string {
  if (typeof window === 'undefined') return 'gemini-2.5-flash';
  let model = localStorage.getItem('gemini_model_id') || 'gemini-2.5-flash';
  
  // TTS models are for audio synthesis, not generateContent text/JSON APIs
  if (model.includes('-tts') || model.includes('tts')) {
    model = 'gemini-2.5-flash';
  }
  return model;
}

export interface GeminiCallOptions {
  maxOutputTokens?: number;
  temperature?: number;
  thinkingBudget?: number;
  systemInstruction?: string;
  signal?: AbortSignal;
}

/**
 * Call Gemini API and parse JSON response.
 * Uses `responseMimeType: 'application/json'` so Gemini returns clean JSON.
 */
export async function callGeminiJSON<T>(
  prompt: string,
  optionsOrSignal?: GeminiCallOptions | AbortSignal,
  signal?: AbortSignal,
): Promise<T> {
  const key = getGeminiKey();
  if (!key) {
    throw new Error('Chưa có Gemini API Key. Vui lòng thêm key trong Cài đặt (⚙️).');
  }

  // Handle backwards compatibility where 2nd param might be AbortSignal
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

  let model = getGeminiModel();
  const temperature = options?.temperature ?? 0.1;
  const maxOutputTokens = options?.maxOutputTokens ?? 8192;
  const thinkingBudget = options?.thinkingBudget !== undefined ? options.thinkingBudget : 0;

  const generationConfig: Record<string, unknown> = {
    temperature,
    maxOutputTokens,
    responseMimeType: 'application/json',
  };

  // Turn off or configure thinking budget to avoid thinking tokens eating the entire output limit
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

  let url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  let res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: activeSignal,
    body: JSON.stringify(requestBody),
  });

  // List of fallback models when experiencing high demand (503/429) or model errors
  const fallbackModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

  // Handle high demand (503 / 429 / overloaded), not found (404), or bad request (400)
  if (!res.ok) {
    const errData = await res.clone().json().catch(() => ({}));
    const errMsg = (errData as { error?: { message?: string } })?.error?.message || '';
    const isHighDemand = res.status === 503 || res.status === 429 || errMsg.toLowerCase().includes('high demand') || errMsg.toLowerCase().includes('overloaded') || errMsg.toLowerCase().includes('quota');
    const isNotFound = res.status === 404 || res.status === 400 || errMsg.includes('not found') || errMsg.includes('not supported');

    if (isHighDemand || isNotFound) {
      for (const fallback of fallbackModels) {
        if (fallback === model) continue;
        console.warn(`Model ${model} bị quá tải hoặc lỗi (${errMsg || res.status}). Đang tự động chuyển sang thử ${fallback}...`);
        
        // Wait 800ms before retrying on fallback model
        await new Promise((resolve) => setTimeout(resolve, 800));

        const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/${fallback}:generateContent?key=${key}`;
        const fallbackRes = await fetch(fallbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: activeSignal,
          body: JSON.stringify(requestBody),
        });

        if (fallbackRes.ok) {
          res = fallbackRes;
          model = fallback;
          break;
        }
      }
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg =
      (err as { error?: { message?: string } }).error?.message ||
      `HTTP ${res.status}`;
    throw new Error(`Gemini API lỗi: ${msg}`);
  }

  const data = await res.json();
  let raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Strip markdown fences if Gemini returns them despite responseMimeType
  raw = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  // Try extracting the outermost valid JSON object or array
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    raw = raw.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    // Attempt cleaning trailing commas, unescaped characters, or comments
    try {
      const sanitized = raw
        .replace(/,\s*([\]}])/g, '$1') // remove trailing commas
        .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1'); // remove inline comments
      return JSON.parse(sanitized) as T;
    } catch {
      console.error('Lỗi parse JSON từ Gemini. Raw content:', raw);
      throw new Error('Gemini trả về dữ liệu JSON không hợp lệ. Vui lòng thử lại.');
    }
  }
}
