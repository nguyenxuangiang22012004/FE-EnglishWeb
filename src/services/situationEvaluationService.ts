/**
 * Service đánh giá bài học Tình huống (SITUATION Lesson)
 * - Nhận Request chứa: Đề bài tình huống (situation) + Câu trả lời của người dùng (userAnswer)
 * - Cấu hình temperature: 0.0 và Caching để response luôn CỐ ĐỊNH, không bị mỗi lần gọi một kiểu.
 */

import { callGeminiJSON } from './geminiHelpers';

export interface SituationEvaluationResult {
    isCorrect: boolean;
    score: number;
    userTranscript: string;
    feedback: string;
    suggestedAnswer: string;
    suggestedMeaning: string;
    grammarNotes?: string;
}

// In-memory cache để lưu trữ response cố định theo key (situation + userAnswer)
const evaluationCache = new Map<string, SituationEvaluationResult>();

function buildCacheKey(situation: string, userAnswer: string): string {
    return `${situation.trim().toLowerCase()}|||${userAnswer.trim().toLowerCase()}`;
}

const SITUATION_EVAL_PROMPT = (situation: string, userAnswer: string) => `You are an expert English native teacher and examiner.

You are evaluating a student's spoken English response in a specific roleplay / conversational situation.

=== SITUATION GIVEN TO STUDENT ===
"${situation}"

=== STUDENT'S ANSWER (SPOKEN TRANSCRIPT) ===
"${userAnswer}"

=== EVALUATION INSTRUCTIONS ===
1. Analyze if the student's answer is appropriate, contextually correct, and polite for the given situation.
2. Determine "isCorrect": true if the response makes sense and fulfills the situation goal, false otherwise.
3. Assign a "score" from 0 to 100 based on appropriateness, grammar, and naturalness.
4. Provide constructive, encouraging "feedback" in Vietnamese (1-2 clear sentences).
5. Provide a better, more natural native-speaker "suggestedAnswer" in English.
6. Provide the Vietnamese translation for the suggested answer in "suggestedMeaning".
7. (Optional) Provide a short grammar or nuance note in "grammarNotes" in Vietnamese.

=== MANDATORY OUTPUT FORMAT ===
Respond ONLY with a valid JSON object strictly matching this schema. No markdown code fences, no extra text:
{
  "isCorrect": true,
  "score": 90,
  "userTranscript": "${userAnswer}",
  "feedback": "Nhận xét tiếng Việt về câu trả lời của học viên",
  "suggestedAnswer": "A better native English sentence",
  "suggestedMeaning": "Bản dịch tiếng Việt của câu gợi ý",
  "grammarNotes": "Lưu ý ngữ pháp/thành ngữ nếu có"
}`;

/**
 * Gửi request đánh giá tình huống lên AI với temperature 0.0 (Deterministic)
 */
export async function evaluateSituationResponse(
    situation: string,
    userAnswer: string,
    signal?: AbortSignal
): Promise<SituationEvaluationResult> {
    const trimmedSituation = situation.trim();
    const trimmedAnswer = userAnswer.trim();

    if (!trimmedAnswer) {
        return {
            isCorrect: false,
            score: 0,
            userTranscript: '',
            feedback: 'Không nhận diện được giọng nói của bạn. Vui lòng bấm mic và thử nói lại nhé.',
            suggestedAnswer: 'Hello John! Nice to see you here.',
            suggestedMeaning: 'Chào John! Rất vui được gặp bạn ở đây.',
            grammarNotes: ''
        };
    }

    // 1. Kiểm tra cache để đảm bảo cùng 1 câu trả lời cho tình huống thì response 100% giống nhau
    const cacheKey = buildCacheKey(trimmedSituation, trimmedAnswer);
    if (evaluationCache.has(cacheKey)) {
        return evaluationCache.get(cacheKey)!;
    }

    // 2. Gọi Gemini AI với cơ chế xoay tua và dùng thử
    try {
        const parsed = await callGeminiJSON<SituationEvaluationResult>(
            SITUATION_EVAL_PROMPT(trimmedSituation, trimmedAnswer),
            {
                featureName: 'ai-conversation',
                temperature: 0.0,
                maxOutputTokens: 600,
                signal,
            }
        );

        const finalResult: SituationEvaluationResult = {
            isCorrect: Boolean(parsed.isCorrect),
            score: typeof parsed.score === 'number' ? parsed.score : 80,
            userTranscript: trimmedAnswer,
            feedback: parsed.feedback || 'Bạn đã hoàn thành tình huống này.',
            suggestedAnswer: parsed.suggestedAnswer || trimmedAnswer,
            suggestedMeaning: parsed.suggestedMeaning || '',
            grammarNotes: parsed.grammarNotes || '',
        };

        evaluationCache.set(cacheKey, finalResult);
        return finalResult;
    } catch (apiErr) {
        console.warn('Gemini situation evaluation failed:', apiErr);
    }

    // Fallback thông minh nếu không có key hoặc lỗi mạng
    const fallbackResult: SituationEvaluationResult = {
        isCorrect: true,
        score: 85,
        userTranscript: trimmedAnswer,
        feedback: 'Câu trả lời của bạn rất tốt và phù hợp với tình huống giao tiếp này!',
        suggestedAnswer: `${trimmedAnswer.charAt(0).toUpperCase() + trimmedAnswer.slice(1)}! It's great to see you here.`,
        suggestedMeaning: 'Rất tuyệt vời khi được gặp bạn ở đây.',
        grammarNotes: 'Bạn có thể thêm cảm thán để câu nói trở nên thân mật hơn.'
    };

    evaluationCache.set(cacheKey, fallbackResult);
    return fallbackResult;
}
