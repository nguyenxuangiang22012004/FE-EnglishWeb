// services/aiListening.ts
// Thay thế youtubeTranscript.ts — dùng Gemini để sinh bài nghe theo chủ đề
import axios from '@/config/axios';

export interface ListeningQuestion {
  id: number;
  question: string;
  options: string[]; // ["A. ...", "B. ...", "C. ...", "D. ..."]
  answer: string;    // "A" | "B" | "C" | "D"
  explanation?: string;
}

export interface ListeningLesson {
  title: string;
  topic: string;
  level: CEFRLevel;
  passage: string;
  questions: ListeningQuestion[];
}

export type CEFRLevel = 'A2' | 'B1' | 'B2' | 'C1';

export interface QuizResult {
  questionId: number;
  userAnswer: string;
  correct: boolean;
}

// ─── Gemini API ────────────────────────────────────────────────────────────────

function getGeminiKey(): string {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('gemini_api_key') ||
    localStorage.getItem('geminiKey') ||
    ''
  );
}

function getGeminiModel(): string {
  if (typeof window === 'undefined') return 'gemini-1.5-pro';
  return localStorage.getItem('gemini_model_id') || 'gemini-1.5-pro';
}

export async function generateListeningLesson(
  topic: string,
  level: CEFRLevel,
  questionCount: number = 5
): Promise<ListeningLesson> {
  const key = getGeminiKey();
  if (!key) throw new Error('Chưa có Gemini API Key. Vui lòng thêm key trong Cài đặt.');
  const model = getGeminiModel();

  const wordCountMap: Record<CEFRLevel, string> = {
    A2: '80-110',
    B1: '120-160',
    B2: '160-210',
    C1: '200-260',
  };

  const prompt = `You are an expert English listening comprehension test creator for Vietnamese learners.

Topic: "${topic}"
CEFR Level: ${level}
Passage length: ${wordCountMap[level]} words
Number of questions: ${questionCount}

Instructions:
- Write a natural, engaging English passage suitable for ${level} learners
- The passage must sound natural and clear when read aloud by a text-to-speech engine
- Avoid complex abbreviations or symbols that TTS reads poorly
- Create ${questionCount} multiple-choice questions testing comprehension (not just vocabulary)
- Questions should test: main idea, specific details, inference, vocabulary in context
- Each question has exactly 4 options (A, B, C, D) with only one correct answer
- Add a brief one-sentence explanation for each answer

Respond ONLY with a valid JSON object (no markdown, no code fences, no extra text):
{
  "title": "Concise descriptive title (5-8 words)",
  "passage": "Full passage text here...",
  "questions": [
    {
      "id": 1,
      "question": "What is the main idea of the passage?",
      "options": ["A. First option", "B. Second option", "C. Third option", "D. Fourth option"],
      "answer": "A",
      "explanation": "The passage mainly discusses..."
    }
  ]
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } }).error?.message || `HTTP ${res.status}`;
    throw new Error(`Gemini API lỗi: ${msg}`);
  }

  const data = await res.json();
  let raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Strip markdown fences if Gemini returns them despite responseMimeType
  raw = raw.replace(/```json[\s\S]*?```/g, (m: string) => m.slice(m.indexOf('\n') + 1, m.lastIndexOf('```')));
  raw = raw.replace(/```[\s\S]*?```/g, '').trim();

  let parsed: Omit<ListeningLesson, 'topic' | 'level'>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Gemini trả về dữ liệu không hợp lệ. Vui lòng thử lại.');
  }

  if (!parsed.passage || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    throw new Error('Bài nghe tạo ra bị thiếu dữ liệu. Vui lòng thử lại.');
  }

  return { ...parsed, topic, level };
}

// ─── Scoring ───────────────────────────────────────────────────────────────────

export function scoreQuiz(
  questions: ListeningQuestion[],
  userAnswers: Record<number, string>
): QuizResult[] {
  return questions.map((q) => ({
    questionId: q.id,
    userAnswer: userAnswers[q.id] ?? '',
    correct: userAnswers[q.id] === q.answer,
  }));
}

export function calcScore(results: QuizResult[]): number {
  if (!results.length) return 0;
  const correct = results.filter((r) => r.correct).length;
  return Math.round((correct / results.length) * 100);
}

// ─── TTS helpers ──────────────────────────────────────────────────────────────

export function getEnglishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined') return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
}

export const EXAMPLE_TOPICS: { label: string; topic: string; level: CEFRLevel }[] = [
  { label: '☕ Coffee shop chat', topic: 'A conversation between two friends at a London coffee shop', level: 'A2' },
  { label: '🌿 Environment', topic: 'How cities are becoming greener and more eco-friendly', level: 'B1' },
  { label: '🧠 Psychology', topic: 'Why people procrastinate and how to overcome it', level: 'B2' },
  { label: '🚀 Technology', topic: 'The impact of artificial intelligence on the future of work', level: 'B2' },
  { label: '🌏 Travel', topic: 'Tips for solo backpacking across Southeast Asia on a budget', level: 'B1' },
  { label: '🍣 Food culture', topic: 'The history and culture of Japanese street food', level: 'B1' },
  { label: '🎭 Arts', topic: 'How modern theater is adapting to digital audiences', level: 'C1' },
];

// ─── API History ──────────────────────────────────────────────────────────────

export interface SaveAiListeningHistoryRequest {
  topic: string;
  level: CEFRLevel;
  lessonData: ListeningLesson;
  userAnswersData: Record<number, string>;
  score: number;
}

export interface AiListeningHistoryResponse {
  id: string;
  topic: string;
  level: CEFRLevel;
  lessonData: ListeningLesson;
  userAnswersData: Record<number, string>;
  score: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export async function saveListeningHistory(data: SaveAiListeningHistoryRequest): Promise<AiListeningHistoryResponse> {
  const res = await axios.post('/ai-listening/history', data);
  return res.data.data; // assuming ApiResponse wrapper
}

export async function getListeningHistory(page = 0, size = 10): Promise<PaginatedResponse<AiListeningHistoryResponse>> {
  const res = await axios.get('/ai-listening/history', { params: { page, size } });
  return res.data.data;
}