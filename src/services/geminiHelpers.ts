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
  return localStorage.getItem('gemini_model_id') || 'gemini-2.5-flash';
}

/**
 * Call Gemini API and parse JSON response.
 * Uses `responseMimeType: 'application/json'` so Gemini returns clean JSON.
 */
export async function callGeminiJSON<T>(
  prompt: string,
  signal?: AbortSignal,
): Promise<T> {
  const key = getGeminiKey();
  if (!key) {
    throw new Error('Chưa có Gemini API Key. Vui lòng thêm key trong Cài đặt (⚙️).');
  }

  const model = getGeminiModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 512,
        responseMimeType: 'application/json',
      },
    }),
  });

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
    .replace(/```json[\s\S]*?```/g, (m: string) =>
      m.slice(m.indexOf('\n') + 1, m.lastIndexOf('```')),
    )
    .replace(/```[\s\S]*?```/g, '')
    .trim();

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error('Gemini trả về dữ liệu không hợp lệ. Vui lòng thử lại.');
  }
}
