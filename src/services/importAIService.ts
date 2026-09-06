/**
 * importAIService.ts
 * Gemini API calls for AI-powered vocabulary import.
 * Supports two modes:
 *   1. Topic → Vocabulary (text-only)
 *   2. Image → Vocabulary (multimodal vision)
 *
 * Uses `responseSchema` to guarantee Gemini always returns
 * a valid JSON array – no extra text, no parse errors.
 */

import { getGeminiKey, getGeminiModel } from './geminiHelpers';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AIVocabItem {
    word: string;
    meaning: string;
    pronunciation: string;
    example: string;
    partOfSpeech: string;
}

// ─── Schema (shared) ─────────────────────────────────────────────────────────

const VOCAB_RESPONSE_SCHEMA = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            word: { type: 'string' },
            meaning: { type: 'string' },
            pronunciation: { type: 'string' },
            example: { type: 'string' },
            partOfSpeech: { type: 'string' },
        },
        required: ['word', 'meaning', 'pronunciation', 'example', 'partOfSpeech'],
    },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildGeminiUrl(): string {
    const key = getGeminiKey();
    if (!key) {
        throw new Error(
            'Chưa có Gemini API Key. Vui lòng thêm key trong Cài đặt (⚙️).',
        );
    }
    const model = getGeminiModel();
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
}

async function parseGeminiResponse(res: Response): Promise<AIVocabItem[]> {
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg =
            (err as { error?: { message?: string } }).error?.message ??
            `HTTP ${res.status}`;
        throw new Error(`Gemini API lỗi: ${msg}`);
    }

    const data = await res.json();
    let raw: string =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Strip markdown fences (fallback safety)
    raw = raw
        .replace(/```json[\s\S]*?```/g, (m: string) =>
            m.slice(m.indexOf('\n') + 1, m.lastIndexOf('```')),
        )
        .replace(/```[\s\S]*?```/g, '')
        .trim();

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            throw new Error('Response không phải array');
        }
        return parsed as AIVocabItem[];
    } catch {
        throw new Error('Gemini trả về dữ liệu không hợp lệ. Vui lòng thử lại.');
    }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate vocabulary from a text topic.
 * @param topic   - VD: "Food & Cooking", "Technology"
 * @param count   - Số từ mong muốn
 * @param signal  - Optional AbortSignal
 */
export async function generateVocabularyByTopic(
    topic: string,
    count: number,
    signal?: AbortSignal,
): Promise<AIVocabItem[]> {
    const url = buildGeminiUrl();

    const prompt =
        `Bạn là trợ lý học tiếng Anh chuyên nghiệp. Hãy tạo danh sách đúng ${count} từ vựng tiếng Anh về chủ đề: "${topic}".\n\n` +
        `Yêu cầu bắt buộc:\n` +
        `- Chọn các từ phổ biến, hữu ích và thực tế với chủ đề\n` +
        `- word: từ tiếng Anh\n` +
        `- meaning: nghĩa tiếng Việt ngắn gọn\n` +
        `- pronunciation: phiên âm IPA (VD: /ˈæpəl/)\n` +
        `- example: câu ví dụ tiếng Anh tự nhiên có chứa từ đó\n` +
        `- partOfSpeech: từ loại (noun, verb, adjective, adverb, ...)\n` +
        `- Không trùng lặp từ\n` +
        `- Trả về đúng ${count} từ, không nhiều hơn, không ít hơn`;

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 4096,
                responseMimeType: 'application/json',
                responseSchema: VOCAB_RESPONSE_SCHEMA,
            },
        }),
    });

    return parseGeminiResponse(res);
}

/**
 * Generate vocabulary from an image (Gemini Vision).
 * @param base64Image - Base64-encoded image data (without data URI prefix)
 * @param mimeType    - VD: "image/jpeg", "image/png"
 * @param count       - Số từ mong muốn
 * @param signal      - Optional AbortSignal
 */
export async function generateVocabularyByImage(
    base64Image: string,
    mimeType: string,
    count: number,
    signal?: AbortSignal,
): Promise<AIVocabItem[]> {
    const url = buildGeminiUrl();

    const prompt =
        `Phân tích hình ảnh này. Hãy tạo danh sách khoảng ${count} từ vựng tiếng Anh dựa trên hình ảnh.\n\n` +
        `Hướng dẫn:\n` +
        `- Nếu ảnh chứa văn bản/từ vựng tiếng Anh: hãy trích xuất các từ đó\n` +
        `- Nếu ảnh là cảnh vật/đồ vật/con người: hãy tạo từ vựng mô tả những gì bạn thấy\n` +
        `- Nếu ảnh là sách/tài liệu học: trích xuất từ vựng học thuật liên quan\n\n` +
        `Yêu cầu bắt buộc cho mỗi từ:\n` +
        `- word: từ tiếng Anh\n` +
        `- meaning: nghĩa tiếng Việt ngắn gọn\n` +
        `- pronunciation: phiên âm IPA (VD: /ˈæpəl/)\n` +
        `- example: câu ví dụ tiếng Anh tự nhiên\n` +
        `- partOfSpeech: từ loại (noun, verb, adjective, adverb, ...)\n` +
        `- Tạo đúng ${count} từ, không trùng lặp`;

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            inlineData: {
                                mimeType,
                                data: base64Image,
                            },
                        },
                        { text: prompt },
                    ],
                },
            ],
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 4096,
                responseMimeType: 'application/json',
                responseSchema: VOCAB_RESPONSE_SCHEMA,
            },
        }),
    });

    return parseGeminiResponse(res);
}
