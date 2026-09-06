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
  passageVi: string; // bản dịch tiếng Việt của passage
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
  if (typeof window === 'undefined') return 'gemini-2.5-flash';
  return localStorage.getItem('gemini_model_id') || 'gemini-2.5-flash';
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

      // id: ép về number, fallback là index + 1
      const id =
        typeof qRaw['id'] === 'number'
          ? qRaw['id']
          : typeof qRaw['id'] === 'string' && !isNaN(Number(qRaw['id']))
            ? Number(qRaw['id'])
            : index + 1;

      // question text
      const questionText =
        typeof qRaw['question'] === 'string' && qRaw['question'].trim()
          ? qRaw['question'].trim()
          : `Question ${id}`;

      // options: đảm bảo đúng 4 phần tử format "A. ...", "B. ...", "C. ...", "D. ..."
      let options: string[] = [];

      if (Array.isArray(qRaw['options'])) {
        options = (qRaw['options'] as unknown[]).slice(0, 4).map((opt, i) => {
          const prefix = OPTION_PREFIXES[i];
          const optStr = typeof opt === 'string' ? opt.trim() : `Option ${VALID_ANSWERS[i]}`;

          // Nếu đã có prefix đúng rồi thì giữ nguyên
          if (optStr.startsWith(prefix)) return optStr;

          // Nếu có prefix khác (VD: "A) ..." hoặc "a. ...") thì chuẩn hóa
          const stripped = optStr.replace(/^[A-Da-d][.):\s]+/, '').trim();
          return `${prefix}${stripped}`;
        });
      }

      // Điền đủ 4 options nếu thiếu
      while (options.length < 4) {
        options.push(`${OPTION_PREFIXES[options.length]}(No option provided)`);
      }

      // answer: chỉ lấy ký tự đầu tiên, uppercase
      // Xử lý các case lạ: "Answer: A", "a", "A.", "(A)", v.v.
      let answer = 'A';
      if (typeof qRaw['answer'] === 'string') {
        const answerRaw = qRaw['answer'].trim().toUpperCase();
        // Tìm ký tự A/B/C/D đầu tiên trong chuỗi
        const match = answerRaw.match(/[A-D]/);
        if (match) answer = match[0];
      }

      // explanation
      const explanation =
        typeof qRaw['explanation'] === 'string' && qRaw['explanation'].trim()
          ? qRaw['explanation'].trim()
          : `The correct answer is ${answer}.`;

      return { id, question: questionText, options, answer, explanation };
    });

  if (questions.length === 0) {
    throw new Error('Bài nghe tạo ra không có câu hỏi hợp lệ. Vui lòng thử lại.');
  }

  // --- passageVi ---
  const passageVi =
    typeof raw['passageVi'] === 'string' && raw['passageVi'].trim()
      ? raw['passageVi'].trim()
      : ''; // fallback rỗng — không throw error, UI sẽ ẩn nút song ngữ nếu trống

  return { title, passage, passageVi, questions };
}

// ─── Generate ─────────────────────────────────────────────────────────────────

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

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
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
  raw = raw
    .replace(/```json[\s\S]*?```/g, (m: string) => m.slice(m.indexOf('\n') + 1, m.lastIndexOf('```')))
    .replace(/```[\s\S]*?```/g, '')
    .trim();

  // Trích xuất JSON object đầu tiên nếu AI có text thừa bao quanh
  const jsonStart = raw.indexOf('{');
  const jsonEnd = raw.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    raw = raw.slice(jsonStart, jsonEnd + 1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Gemini trả về dữ liệu không phải JSON hợp lệ. Vui lòng thử lại.');
  }

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

export async function updateListeningHistory(id: string, data: Partial<SaveAiListeningHistoryRequest>): Promise<AiListeningHistoryResponse> {
  const res = await axios.put(`/ai-listening/history/${id}`, data);
  return res.data.data;
}

export async function getListeningHistory(page = 0, size = 10): Promise<PaginatedResponse<AiListeningHistoryResponse>> {
  const res = await axios.get('/ai-listening/history', { params: { page, size } });
  return res.data.data;
}

export async function getListeningHistoryById(id: string): Promise<AiListeningHistoryResponse> {
  const res = await axios.get(`/ai-listening/history/${id}`);
  return res.data.data;
}