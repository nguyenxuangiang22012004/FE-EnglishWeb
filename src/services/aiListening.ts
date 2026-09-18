// services/aiListening.ts
// Luyện nghe AI — dùng Gemini để sinh bài nghe theo chủ đề với Trial Quota & Fallback Model
import axios from '@/config/axios';
import { callGeminiJSON } from './geminiHelpers';

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
  passageVi: string; // bản dịch tiếng Việt của passage
  questions: ListeningQuestion[];
}

export type CEFRLevel = 'A2' | 'B1' | 'B2' | 'C1';

export interface QuizResult {
  questionId: number;
  userAnswer: string;
  correct: boolean;
}

export interface ExampleTopic {
  label: string;
  topic: string;
  level: CEFRLevel;
}

export const EXAMPLE_TOPICS: ExampleTopic[] = [
  { label: '☕ Quán cà phê buổi sáng', topic: 'A Morning at a Cozy Coffee Shop', level: 'A2' },
  { label: '✈️ Kế hoạch du lịch', topic: 'Planning a Weekend Trip with Friends', level: 'B1' },
  { label: '💼 Phỏng vấn xin việc', topic: 'A Professional Job Interview Experience', level: 'B2' },
  { label: '🌍 Biến đổi khí hậu', topic: 'Climate Change and Daily Sustainable Habits', level: 'B2' },
  { label: '🍜 Ẩm thực đường phố', topic: 'Exploring Local Street Food Markets', level: 'B1' },
  { label: '🤖 Trí tuệ nhân tạo trong giáo dục', topic: 'Artificial Intelligence Trends in Modern Education', level: 'C1' },
];

export function getEnglishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
}

// ─── Validation & Normalization ───────────────────────────────────────────────

/**
 * Kiểm tra và chuẩn hóa dữ liệu trả về từ AI model.
 * Đảm bảo luôn đúng cấu trúc ListeningLesson dù AI trả về format không chuẩn.
 */
function validateAndNormalize(
  parsed: unknown,
  topic: string,
  level: CEFRLevel,
  questionCount: number
): Omit<ListeningLesson, 'topic' | 'level'> {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Dữ liệu từ AI không phải object hợp lệ.');
  }

  const raw = parsed as Record<string, unknown>;

  // --- title ---
  const title =
    typeof raw['title'] === 'string' && raw['title'].trim()
      ? raw['title'].trim()
      : `${level} Listening: ${topic.slice(0, 40)}`;

  // --- passage ---
  const passage =
    typeof raw['passage'] === 'string' && raw['passage'].trim()
      ? raw['passage'].trim()
      : '';

  if (!passage) {
    throw new Error('AI không tạo được đoạn văn bài nghe. Vui lòng thử lại.');
  }

  // --- passageVi ---
  const passageVi =
    typeof raw['passageVi'] === 'string' && raw['passageVi'].trim()
      ? raw['passageVi'].trim()
      : '';

  // --- questions ---
  if (!Array.isArray(raw['questions']) || raw['questions'].length === 0) {
    throw new Error('AI không tạo được câu hỏi. Vui lòng thử lại.');
  }

  const VALID_ANSWERS = ['A', 'B', 'C', 'D'];
  const OPTION_PREFIXES = ['A. ', 'B. ', 'C. ', 'D. '];

  const questions: ListeningQuestion[] = (raw['questions'] as unknown[])
    .slice(0, questionCount)
    .map((q, index) => {
      if (!q || typeof q !== 'object') {
        throw new Error(`Câu hỏi số ${index + 1} không hợp lệ.`);
      }

      const qRaw = q as Record<string, unknown>;

      const id = typeof qRaw['id'] === 'number' ? qRaw['id'] : index + 1;

      const questionText =
        typeof qRaw['question'] === 'string' && qRaw['question'].trim()
          ? qRaw['question'].trim()
          : `Question ${index + 1}`;

      let rawOptions: string[] = [];
      if (Array.isArray(qRaw['options'])) {
        rawOptions = (qRaw['options'] as unknown[])
          .map((opt) => (typeof opt === 'string' ? opt.trim() : ''))
          .filter(Boolean);
      }

      const options: string[] = OPTION_PREFIXES.map((prefix, i) => {
        const rawOpt = rawOptions[i] ?? `Option ${prefix[0]}`;
        if (/^[A-D]\.\s/i.test(rawOpt)) {
          return `${prefix[0].toUpperCase()}. ${rawOpt.replace(/^[A-D]\.\s*/i, '')}`;
        }
        return `${prefix}${rawOpt}`;
      });

      let answer = 'A';
      if (typeof qRaw['answer'] === 'string') {
        const match = qRaw['answer'].trim().toUpperCase().match(/[A-D]/);
        if (match && VALID_ANSWERS.includes(match[0])) {
          answer = match[0];
        }
      }

      const explanation =
        typeof qRaw['explanation'] === 'string' && qRaw['explanation'].trim()
          ? qRaw['explanation'].trim()
          : undefined;

      return { id, question: questionText, options, answer, explanation };
    });

  if (questions.length === 0) {
    throw new Error('AI không tạo được câu hỏi trắc nghiệm hợp lệ. Vui lòng thử lại.');
  }

  return { title, passage, passageVi, questions };
}

// ─── Sinh bài nghe với Gemini ──────────────────────────────────────────────────

export async function generateListeningLesson(
  topic: string,
  level: CEFRLevel = 'B1',
  questionCount: number = 5
): Promise<ListeningLesson> {
  const wordCountMap: Record<CEFRLevel, string> = {
    A2: '80-110',
    B1: '120-160',
    B2: '160-210',
    C1: '200-260',
  };

  const prompt = `You are an expert English listening comprehension test creator for Vietnamese learners.

TASK: Generate a listening lesson in STRICT JSON format.

Topic: "${topic}"
CEFR Level: ${level}
Passage length: approximately ${wordCountMap[level]} words
Number of questions: exactly ${questionCount}

CRITICAL JSON REQUIREMENTS — follow every rule exactly:
1. Output ONLY a raw JSON object. Do NOT include markdown, code fences (\`\`\`), or any text outside the JSON.
2. The root object must have exactly these 4 keys: "title", "passage", "passageVi", "questions".
3. "title": a string, 5–8 words describing the passage topic.
4. "passage": a string containing the full English passage. Must be natural and clear for TTS. No markdown inside.
5. "passageVi": a string containing the complete Vietnamese translation of the passage. Translate naturally and fluently. Match sentence count and order with the English passage. No markdown inside.
6. "questions": a JSON array of exactly ${questionCount} objects. Each object must have:
   - "id": an integer starting from 1 (e.g., 1, 2, 3...)
   - "question": a string with the question text
   - "options": a JSON array of EXACTLY 4 strings. Each string MUST start with the letter prefix exactly as shown: "A. ", "B. ", "C. ", "D. " (capital letter, period, space). Example: ["A. London", "B. Paris", "C. Tokyo", "D. Sydney"]
   - "answer": a single UPPERCASE letter string — ONLY one of: "A", "B", "C", or "D". No other characters.
   - "explanation": a string with a one-sentence explanation of why the answer is correct.

WHAT NOT TO DO:
- Do NOT wrap the JSON in any extra object or array
- Do NOT add any keys other than the ones specified
- Do NOT use "Answer: A" or "(A)" format — only a single character like "A"
- Do NOT leave any field empty or null
- Do NOT add any commentary before or after the JSON

EXAMPLE of valid output (use this exact structure):
{
  "title": "Daily Life at a Coffee Shop",
  "passage": "Every morning, Sara visits the small coffee shop on Maple Street. She orders a latte and reads the newspaper before heading to work.",
  "passageVi": "Mỗi sáng, Sara đến quán cà phê nhỏ trên phố Maple. Cô gọi một ly latte và đọc báo trước khi đi làm.",
  "questions": [
    {
      "id": 1,
      "question": "Where does Sara visit every morning?",
      "options": ["A. A bakery on Oak Street", "B. A coffee shop on Maple Street", "C. A library on Pine Avenue", "D. A park near her home"],
      "answer": "B",
      "explanation": "The passage states that Sara visits the coffee shop on Maple Street every morning."
    }
  ]
}`;

  const parsed = await callGeminiJSON<unknown>(prompt, {
    featureName: 'ai-listening',
    temperature: 0.7,
    maxOutputTokens: 2048,
  });

  const normalized = validateAndNormalize(parsed, topic, level, questionCount);
  return { ...normalized, topic, level };
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
  const correctCount = results.filter((r) => r.correct).length;
  return Math.round((correctCount / results.length) * 100);
}

// ─── Lịch sử & Backend API ─────────────────────────────────────────────────────

export interface SaveListeningHistoryPayload {
  topic: string;
  level: CEFRLevel;
  lessonData: ListeningLesson;
  userAnswersData?: Record<number, string>;
  score?: number;
}

export interface AiListeningHistoryResponse {
  id: string;
  topic: string;
  level: CEFRLevel;
  lessonData: ListeningLesson;
  userAnswersData: Record<number, string>;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export async function saveListeningHistory(
  payload: SaveListeningHistoryPayload
): Promise<AiListeningHistoryResponse> {
  const res = await axios.post('/ai-listening/history', payload);
  return res.data?.data;
}

export async function updateListeningHistory(
  id: string,
  payload: { userAnswersData?: Record<number, string>; score?: number }
): Promise<AiListeningHistoryResponse> {
  const res = await axios.put(`/ai-listening/history/${id}`, payload);
  return res.data?.data;
}

export async function getListeningHistoryById(
  id: string
): Promise<AiListeningHistoryResponse> {
  const res = await axios.get(`/ai-listening/history/${id}`);
  return res.data?.data;
}

export async function getListeningHistory(
  page = 0,
  size = 10
): Promise<PaginatedResponse<AiListeningHistoryResponse>> {
  const res = await axios.get('/ai-listening/history', { params: { page, size } });
  return res.data?.data;
}