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

  const prompt = `You are a world-class English Listening Examination Designer (specializing in IELTS, TOEIC, and Cambridge assessment frameworks).

TASK: Create a high-quality listening comprehension lesson in STRICT JSON format that evaluates genuine comprehension (Nghe - Hiểu thực chất) rather than simple superficial keyword spotting.

Topic: "${topic}"
CEFR Level: ${level}
Passage length: approximately ${wordCountMap[level]} words
Number of questions: exactly ${questionCount}

======================================================================
CORE PEDAGOGICAL RULES (CRITICAL FOR LISTENING COMPREHENSION):
======================================================================
1. PASSAGE DESIGN:
   - Must sound natural, coherent, and conversational when read aloud by Text-to-Speech (TTS).
   - Must include realistic nuances, contrasting thoughts, or condition shifts (e.g., "We originally planned to... but due to..., we decided to...").
   - Match the target CEFR level (${level}) in vocabulary, sentence structures, and speech markers.

2. ANTI-VERBATIM & PARAPHRASING RULE (MANDATORY):
   - The correct answer option MUST NEVER be a verbatim copy-paste of words from the audio.
   - It MUST rephrase the idea using synonyms, restructuring, or concept abstraction.
   - A learner who only listens for raw keyword sounds without understanding the meaning should NOT be able to find the answer.

3. DISTRACTOR KEYWORD TRAPS (MANDATORY):
   - Distractors (incorrect options) MUST sound plausible and should intentionally reuse some exact words/phrases mentioned in the passage, but distort the meaning (e.g. an idea that was rejected, an earlier outdated plan, opposite effect, or wrong subject).
   - This tests if the listener truly understood the context rather than merely matching sounds.

4. QUESTION DIVERSITY (Spread across the ${questionCount} questions):
   - Main Idea / Purpose (e.g., "What is the primary purpose of the talk?", "What main challenge is discussed?")
   - Paraphrased Detail (e.g., "What led the team to modify their approach?", "How will the project be funded?")
   - Inference / Tone / Implication (e.g., "What can be inferred about...?", "What is the speaker's attitude towards...?")
   - Cause & Effect / Reasoning (e.g., "Why was the initial proposal declined?")

5. EXPLANATION:
   - Provide a clear, educational explanation in English that states the underlying evidence in the passage, explains how the correct answer paraphrases it, and notes why the distractor traps are incorrect.

======================================================================
CRITICAL JSON FORMAT REQUIREMENTS:
======================================================================
1. Output ONLY a valid raw JSON object. Do NOT include markdown blocks (\`\`\`json), comments, or text outside the JSON.
2. The root object must have exactly these 4 keys: "title", "passage", "passageVi", "questions".
3. "title": a concise string (4–8 words) summarizing the theme.
4. "passage": the complete English listening script. No markdown tags inside.
5. "passageVi": natural, accurate, sentence-by-sentence Vietnamese translation of the passage.
6. "questions": a JSON array of exactly ${questionCount} question objects. Each object must have:
   - "id": number (1, 2, 3...)
   - "question": string (clear question testing comprehension)
   - "options": JSON array of exactly 4 strings, each starting with "A. ", "B. ", "C. ", "D. "
   - "answer": string, strictly one of: "A", "B", "C", "D"
   - "explanation": string, explaining the paraphrase and context clues

EXAMPLE OF TRUE COMPREHENSION TEST:
{
  "title": "Renovating the Downtown Public Library",
  "passage": "Good morning staff. Although we initially hoped to keep the reading rooms open during the upcoming renovation, the contractor warned that noise levels and dust would create an unsafe environment. Therefore, the entire facility will temporarily close starting next Monday for two weeks. During this period, all loan deadlines will be automatically extended, so patrons will not incur any overdue penalties.",
  "passageVi": "Chào buổi sáng toàn thể nhân viên. Mặc dù ban đầu chúng tôi hy vọng giữ cho các phòng đọc mở cửa trong đợt tu sửa sắp tới, nhưng nhà thầu đã cảnh báo rằng tiếng ồn và bụi bặm sẽ gây ra môi trường không an toàn. Do đó, toàn bộ cơ sở sẽ tạm thời đóng cửa bắt đầu từ thứ Hai tuần tới trong hai tuần. Trong thời gian này, tất cả hạn trả sách sẽ tự động được gia hạn, vì vậy bạn đọc sẽ không phải chịu bất kỳ khoản phạt quá hạn nào.",
  "questions": [
    {
      "id": 1,
      "question": "What is the primary reason for completely shutting down the building?",
      "options": [
        "A. Hazardous conditions reported by the construction team",
        "B. Low visitor attendance in the reading rooms",
        "C. Severe financial penalties on overdue book loans",
        "D. An urgent plan to replace the library staff"
      ],
      "answer": "A",
      "explanation": "The speaker mentions the contractor warned of unsafe noise and dust, which is paraphrased as 'hazardous conditions reported by the construction team'. Options mentioning overdue penalties or reading rooms are traps using passage keywords in wrong contexts."
    }
  ]
}`;

  const parsed = await callGeminiJSON<unknown>(prompt, {
    featureName: 'ai-listening',
    temperature: 0.7,
    maxOutputTokens: 2500,
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