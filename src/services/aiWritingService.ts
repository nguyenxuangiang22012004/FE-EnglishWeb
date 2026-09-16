// services/aiWritingService.ts
import axios from '@/config/axios';
import { callGeminiJSON } from './geminiHelpers';

export type CEFRLevel = 'A2' | 'B1' | 'B2' | 'C1' | 'IELTS_Task1' | 'IELTS_Task2';

export interface VocabularyHint {
  word: string;
  meaning: string;
  example: string;
}

export interface BodyParagraphOutline {
  title: string;
  points: string[];
}

export interface WritingOutline {
  introduction: string[];
  bodyParagraphs: BodyParagraphOutline[];
  conclusion: string[];
}

export interface BlockPromptInfo {
  name: string;
  description: string;
  suggestedPoints: string[];
}

export interface WritingBlocksInfo {
  block1: BlockPromptInfo;
  block2: BlockPromptInfo;
  block3: BlockPromptInfo;
  block4: BlockPromptInfo;
}

export interface WritingPromptData {
  title: string;
  topic: string;
  level: string;
  prompt: string;
  targetWordCount: number;
  guidingQuestions: string[];
  vocabularyHints: VocabularyHint[];
  outline: WritingOutline;
  blocks: WritingBlocksInfo;
}

export interface SpellingError {
  original: string;
  correction: string;
  context: string;
  explanation: string;
}

export interface GrammarError {
  originalSentence: string;
  correctedSentence: string;
  errorType: string;
  explanation: string;
}

export interface ImprovedSentence {
  originalSentence: string;
  betterSentence: string;
  reason: string;
  bandUpgrade: string;
}

export interface VocabularySuggestion {
  simpleWord: string;
  advancedAlternative: string;
  exampleInContext: string;
}

export interface CriteriaScore {
  score: number;
  comment: string;
}

export interface WritingCriteriaScores {
  grammar: CriteriaScore;
  vocabulary: CriteriaScore;
  coherence: CriteriaScore;
  taskResponse: CriteriaScore;
}

export interface PolishImprovement {
  originalPart: string;
  polishedPart: string;
  explanation: string;
  benefit?: string;
}

export interface NativePolishResult {
  fullPolishedEssay: string;
  keyImprovements: PolishImprovement[];
  overallImpression: string;
}

export interface WritingEvaluationResult {
  overallScore: number; // Thang điểm 10 (ví dụ 7.5, 8.0)
  cefrLevel: string; // A2, B1, B2, C1, C2
  estimatedBand?: string; // Ví dụ "6.0 - 6.5"
  wordCount: number;
  summaryFeedback: string;
  strengths: string[];
  weaknesses: string[];
  criteriaScores: WritingCriteriaScores;
  nativePolish: NativePolishResult;
  spellingErrors: SpellingError[];
  grammarErrors: GrammarError[];
  improvedSentences: ImprovedSentence[];
  vocabularySuggestions: VocabularySuggestion[];
}

// ─── Normalization & Defensive Parsing ─────────────────────────────────────────

function normalizeWritingPrompt(
  parsed: unknown,
  fallbackTopic: string,
  level: string,
  targetWordCount: number
): WritingPromptData {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Dữ liệu từ AI không phải JSON object hợp lệ.');
  }

  const raw = parsed as Record<string, unknown>;

  const title = typeof raw['title'] === 'string' && raw['title'].trim()
    ? raw['title'].trim()
    : `Writing Practice: ${fallbackTopic}`;

  const prompt = typeof raw['prompt'] === 'string' && raw['prompt'].trim()
    ? raw['prompt'].trim()
    : `Write an essay about: ${fallbackTopic}. Express your clear ideas with examples.`;

  const targetWords = typeof raw['targetWordCount'] === 'number' && raw['targetWordCount'] > 0
    ? raw['targetWordCount']
    : targetWordCount;

  // Guiding questions
  const guidingQuestions: string[] = Array.isArray(raw['guidingQuestions'])
    ? (raw['guidingQuestions'] as unknown[])
        .filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
    : [
        `What is the main significance of ${fallbackTopic}?`,
        'What are the key arguments and examples supporting your opinion?'
      ];

  // Vocabulary hints
  const vocabularyHints: VocabularyHint[] = Array.isArray(raw['vocabularyHints'])
    ? (raw['vocabularyHints'] as unknown[]).map((v) => {
        const item = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
        return {
          word: typeof item['word'] === 'string' ? item['word'].trim() : '',
          meaning: typeof item['meaning'] === 'string' ? item['meaning'].trim() : '',
          example: typeof item['example'] === 'string' ? item['example'].trim() : '',
        };
      }).filter((v) => v.word.length > 0)
    : [];

  // Outline
  const rawOutline = (raw['outline'] && typeof raw['outline'] === 'object' ? raw['outline'] : {}) as Record<string, unknown>;
  const introduction: string[] = Array.isArray(rawOutline['introduction'])
    ? (rawOutline['introduction'] as unknown[]).filter((i): i is string => typeof i === 'string')
    : ['Introduce the topic and provide background context.', 'State your main thesis statement / opinion.'];

  const bodyParagraphs: BodyParagraphOutline[] = Array.isArray(rawOutline['bodyParagraphs'])
    ? (rawOutline['bodyParagraphs'] as unknown[]).map((bp, index) => {
        const bpObj = (bp && typeof bp === 'object' ? bp : {}) as Record<string, unknown>;
        const title = typeof bpObj['title'] === 'string' ? bpObj['title'] : `Paragraph ${index + 1}`;
        const points = Array.isArray(bpObj['points'])
          ? (bpObj['points'] as unknown[]).filter((p): p is string => typeof p === 'string')
          : [];
        return { title, points };
      })
    : [
        { title: 'Body 1: First Main Argument', points: ['State main idea', 'Explain reasoning and provide example'] },
        { title: 'Body 2: Second Main Argument', points: ['State supporting idea or counter-argument', 'Explain outcome'] },
      ];

  const conclusion: string[] = Array.isArray(rawOutline['conclusion'])
    ? (rawOutline['conclusion'] as unknown[]).filter((c): c is string => typeof c === 'string')
    : ['Summarize the key points discussed.', 'Provide a final thought or recommendation.'];

  // Construct structured 4-block guidance for outline-based writing
  const body1Points = bodyParagraphs[0]?.points || ['Nêu ý chính đầu tiên (Topic sentence)', 'Giải thích lý do và đưa ví dụ minh họa (Explanation & Example)'];
  const body2Points = bodyParagraphs[1]?.points || ['Nêu ý chính thứ hai (Second argument)', 'Giải thích lý do và phân tích dẫn chứng (Supporting detail & Example)'];

  const blocks: WritingBlocksInfo = {
    block1: {
      name: 'Block 1: Topic Sentence (Mở bài & Câu chủ đề)',
      description: 'Giới thiệu chủ đề, tạo bối cảnh (Hook) và nêu rõ quan điểm chính của bài viết (Thesis statement).',
      suggestedPoints: introduction,
    },
    block2: {
      name: 'Block 2: Supporting Idea 1 + Example (Luận điểm 1 & Dẫn chứng)',
      description: 'Triển khai luận cứ chính đầu tiên, giải thích rõ nguyên nhân/hệ quả và đưa ví dụ thực tế minh họa.',
      suggestedPoints: body1Points,
    },
    block3: {
      name: 'Block 3: Supporting Idea 2 + Example (Luận điểm 2 & Dẫn chứng)',
      description: 'Triển khai luận cứ thứ hai (hoặc phản biện/góc nhìn bổ sung), giải thích và dẫn chứng cụ thể.',
      suggestedPoints: body2Points,
    },
    block4: {
      name: 'Block 4: Conclusion (Kết bài & Khẳng định lại quan điểm)',
      description: 'Tóm lược các ý chính đã thảo luận, khẳng định lại lập trường và đưa ra thông điệp kết luận/dự đoán.',
      suggestedPoints: conclusion,
    },
  };

  return {
    title,
    topic: fallbackTopic,
    level,
    prompt,
    targetWordCount: targetWords,
    guidingQuestions,
    vocabularyHints,
    outline: {
      introduction,
      bodyParagraphs,
      conclusion,
    },
    blocks,
  };
}

// ─── Gemini Writing Prompt Generation ──────────────────────────────────────────

export async function generateWritingPrompt(
  topic: string,
  level: string = 'B1',
  type: string = 'essay',
  targetWordCount: number = 150
): Promise<WritingPromptData> {
  const systemInstruction = `You are an expert English writing tutor. 
Generate a comprehensive, structured writing prompt and outline to help English learners write an essay.
Output ONLY a single valid JSON object. All vocabulary meanings and outline notes can include concise Vietnamese where helpful.`;

  const prompt = `Create a structured English writing guide for the topic: "${topic}"
Target CEFR/IELTS Level: ${level}
Writing Type: ${type}
Target Word Count: ${targetWordCount} words

Return ONLY this JSON schema:
{
  "title": "Engaging title for this writing task",
  "prompt": "Clear, direct essay question/prompt instructions in English",
  "targetWordCount": ${targetWordCount},
  "guidingQuestions": [
    "Question 1 to stimulate thinking",
    "Question 2 to stimulate thinking",
    "Question 3 to stimulate thinking"
  ],
  "vocabularyHints": [
    {
      "word": "advanced/useful term or collocation",
      "meaning": "Vietnamese meaning and usage notes",
      "example": "An example sentence using this word in context"
    }
  ],
  "outline": {
    "introduction": [
      "Hook / General statement",
      "Thesis statement / Main response"
    ],
    "bodyParagraphs": [
      {
        "title": "Body 1: First Main Point",
        "points": [
          "Topic sentence: ...",
          "Explanation & Example: ..."
        ]
      },
      {
        "title": "Body 2: Second Main Point",
        "points": [
          "Topic sentence: ...",
          "Explanation & Example: ..."
        ]
      }
    ],
    "conclusion": [
      "Restate main argument / thesis",
      "Final concluding thought / recommendation"
    ]
  }
}

Constraints:
- vocabularyHints: 4 to 6 high-value words/phrases matching the target level.
- guidingQuestions: 3 clear questions.
- bodyParagraphs: 2 well-structured body paragraphs.`;

  const raw = await callGeminiJSON<unknown>(prompt, {
    temperature: 0.2,
    maxOutputTokens: 1500,
    thinkingBudget: 0,
    systemInstruction,
  });

  return normalizeWritingPrompt(raw, topic, level, targetWordCount);
}

function normalizeWritingEvaluation(
  parsed: unknown,
  fallbackWordCount: number,
  fallbackLevel: string
): WritingEvaluationResult {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Dữ liệu chấm điểm từ AI không đúng cấu trúc JSON.');
  }

  const raw = parsed as Record<string, unknown>;

  // Criteria Scores (4 standard IELTS/CEFR criteria)
  const rawCriteria = (raw['criteriaScores'] && typeof raw['criteriaScores'] === 'object' ? raw['criteriaScores'] : {}) as Record<string, unknown>;
  const parseCriteriaItem = (key: string, defaultScore: number, defaultComment: string) => {
    const item = (rawCriteria[key] && typeof rawCriteria[key] === 'object' ? rawCriteria[key] : {}) as Record<string, unknown>;
    const score = typeof item['score'] === 'number' && !isNaN(item['score']) 
      ? Number(Math.max(1, Math.min(10, item['score'])).toFixed(1)) 
      : defaultScore;
    const comment = typeof item['comment'] === 'string' && item['comment'].trim() ? item['comment'].trim() : defaultComment;
    return { score, comment };
  };

  // Extract criteria scores individually
  const grammar = parseCriteriaItem('grammar', 6.0, 'Độ chính xác ngữ pháp và cấu trúc câu.');
  const vocabulary = parseCriteriaItem('vocabulary', 6.0, 'Độ đa dạng và chính xác của vốn từ.');
  const coherence = parseCriteriaItem('coherence', 6.0, 'Tính mạch lạc và liên kết ý.');
  const taskResponse = parseCriteriaItem('taskResponse', 6.0, 'Mức độ giải quyết yêu cầu đề bài.');

  const criteriaScores: WritingCriteriaScores = {
    grammar,
    vocabulary,
    coherence,
    taskResponse,
  };

  // Calculate real average score from the 4 criteria
  const calculatedAvgScore = Number(((grammar.score + vocabulary.score + coherence.score + taskResponse.score) / 4).toFixed(1));

  // Score parsing with fallback to calculated average
  let overallScore = calculatedAvgScore;
  if (typeof raw['overallScore'] === 'number' && !isNaN(raw['overallScore'])) {
    overallScore = Number(raw['overallScore'].toFixed(1));
  } else if (typeof raw['overallScore'] === 'string' && !isNaN(Number(raw['overallScore']))) {
    overallScore = Number(Number(raw['overallScore']).toFixed(1));
  }

  // Determine dynamic CEFR level based on real overall score if not provided
  let cefrLevel = typeof raw['cefrLevel'] === 'string' && raw['cefrLevel'].trim()
    ? raw['cefrLevel'].trim()
    : fallbackLevel;

  // Determine dynamic IELTS band based on real overall score if not provided
  let estimatedBand = typeof raw['estimatedBand'] === 'string' && raw['estimatedBand'].trim()
    ? raw['estimatedBand'].trim()
    : undefined;

  if (!estimatedBand) {
    if (overallScore >= 9.0) estimatedBand = '8.5 - 9.0';
    else if (overallScore >= 8.0) estimatedBand = '7.5 - 8.0';
    else if (overallScore >= 7.0) estimatedBand = '6.5 - 7.0';
    else if (overallScore >= 6.0) estimatedBand = '5.5 - 6.0';
    else if (overallScore >= 5.0) estimatedBand = '4.5 - 5.0';
    else if (overallScore >= 4.0) estimatedBand = '3.5 - 4.0';
    else estimatedBand = '3.0 or below';
  }

  const wordCount = typeof raw['wordCount'] === 'number' && raw['wordCount'] > 0
    ? raw['wordCount']
    : fallbackWordCount;

  const summaryFeedback = typeof raw['summaryFeedback'] === 'string' && raw['summaryFeedback'].trim()
    ? raw['summaryFeedback'].trim()
    : 'Hãy xem xét chi tiết các lỗi ngữ pháp, chính tả và đề xuất cải thiện bên dưới để nâng cao band điểm bài viết.';

  const strengths = Array.isArray(raw['strengths'])
    ? (raw['strengths'] as unknown[]).filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    : [];

  const weaknesses = Array.isArray(raw['weaknesses'])
    ? (raw['weaknesses'] as unknown[]).filter((w): w is string => typeof w === 'string' && w.trim().length > 0)
    : [];

  // Native Polish / Rewrite
  const rawPolish = (raw['nativePolish'] && typeof raw['nativePolish'] === 'object' ? raw['nativePolish'] : {}) as Record<string, unknown>;
  const fullPolishedEssay = typeof rawPolish['fullPolishedEssay'] === 'string' && rawPolish['fullPolishedEssay'].trim()
    ? rawPolish['fullPolishedEssay'].trim()
    : 'Chưa có bản viết lại hoàn chỉnh.';

  const overallImpression = typeof rawPolish['overallImpression'] === 'string' && rawPolish['overallImpression'].trim()
    ? rawPolish['overallImpression'].trim()
    : 'Phiên bản viết lại giúp cải thiện sự tự nhiên, phong phú về từ vựng và tính liên kết chặt chẽ hơn.';

  const keyImprovements: PolishImprovement[] = Array.isArray(rawPolish['keyImprovements'])
    ? (rawPolish['keyImprovements'] as unknown[]).map((ki) => {
        const obj = (ki && typeof ki === 'object' ? ki : {}) as Record<string, unknown>;
        return {
          originalPart: typeof obj['originalPart'] === 'string' ? obj['originalPart'] : '',
          polishedPart: typeof obj['polishedPart'] === 'string' ? obj['polishedPart'] : '',
          explanation: typeof obj['explanation'] === 'string' ? obj['explanation'] : '',
          benefit: typeof obj['benefit'] === 'string' ? obj['benefit'] : undefined,
        };
      }).filter((ki) => ki.polishedPart.length > 0)
    : [];

  const nativePolish: NativePolishResult = {
    fullPolishedEssay,
    keyImprovements,
    overallImpression,
  };

  // Spelling errors
  const spellingErrors: SpellingError[] = Array.isArray(raw['spellingErrors'])
    ? (raw['spellingErrors'] as unknown[]).map((e) => {
        const obj = (e && typeof e === 'object' ? e : {}) as Record<string, unknown>;
        return {
          original: typeof obj['original'] === 'string' ? obj['original'] : '',
          correction: typeof obj['correction'] === 'string' ? obj['correction'] : '',
          context: typeof obj['context'] === 'string' ? obj['context'] : '',
          explanation: typeof obj['explanation'] === 'string' ? obj['explanation'] : '',
        };
      }).filter((e) => e.original.length > 0 && e.correction.length > 0)
    : [];

  // Grammar errors
  const grammarErrors: GrammarError[] = Array.isArray(raw['grammarErrors'])
    ? (raw['grammarErrors'] as unknown[]).map((g) => {
        const obj = (g && typeof g === 'object' ? g : {}) as Record<string, unknown>;
        return {
          originalSentence: typeof obj['originalSentence'] === 'string' ? obj['originalSentence'] : '',
          correctedSentence: typeof obj['correctedSentence'] === 'string' ? obj['correctedSentence'] : '',
          errorType: typeof obj['errorType'] === 'string' ? obj['errorType'] : 'Lỗi ngữ pháp',
          explanation: typeof obj['explanation'] === 'string' ? obj['explanation'] : '',
        };
      }).filter((g) => g.originalSentence.length > 0 && g.correctedSentence.length > 0)
    : [];

  // Improved sentences (fallback to keyImprovements if omitted to save LLM tokens)
  const rawImproved = Array.isArray(raw['improvedSentences']) ? (raw['improvedSentences'] as unknown[]) : [];
  const improvedSentences: ImprovedSentence[] = rawImproved.length > 0
    ? rawImproved.map((im) => {
        const obj = (im && typeof im === 'object' ? im : {}) as Record<string, unknown>;
        return {
          originalSentence: typeof obj['originalSentence'] === 'string' ? obj['originalSentence'] : '',
          betterSentence: typeof obj['betterSentence'] === 'string' ? obj['betterSentence'] : '',
          reason: typeof obj['reason'] === 'string' ? obj['reason'] : '',
          bandUpgrade: typeof obj['bandUpgrade'] === 'string' ? obj['bandUpgrade'] : 'Diễn đạt nâng cao',
        };
      }).filter((im) => im.betterSentence.length > 0)
    : keyImprovements.map((ki) => ({
        originalSentence: ki.originalPart,
        betterSentence: ki.polishedPart,
        reason: ki.explanation,
        bandUpgrade: ki.benefit || 'Diễn đạt tự nhiên hơn',
      }));

  // Vocabulary suggestions
  const vocabularySuggestions: VocabularySuggestion[] = Array.isArray(raw['vocabularySuggestions'])
    ? (raw['vocabularySuggestions'] as unknown[]).map((v) => {
        const obj = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
        return {
          simpleWord: typeof obj['simpleWord'] === 'string' ? obj['simpleWord'] : '',
          advancedAlternative: typeof obj['advancedAlternative'] === 'string' ? obj['advancedAlternative'] : '',
          exampleInContext: typeof obj['exampleInContext'] === 'string' ? obj['exampleInContext'] : '',
        };
      }).filter((v) => v.simpleWord.length > 0 && v.advancedAlternative.length > 0)
    : [];

  return {
    overallScore,
    cefrLevel,
    estimatedBand,
    wordCount,
    summaryFeedback,
    strengths,
    weaknesses,
    criteriaScores,
    nativePolish,
    spellingErrors,
    grammarErrors,
    improvedSentences,
    vocabularySuggestions,
  };
}

// ─── Gemini Block-level Evaluation (Ultra-fast & Lightweight) ─────────────────

export interface BlockEvaluationResult {
  isGood: boolean;
  feedback: string;
  corrections: { original: string; corrected: string; explanation: string }[];
  improvedVersion: string;
}

export async function evaluateWritingBlock(
  topic: string,
  blockTitle: string,
  blockContent: string,
  level: string = 'B1'
): Promise<BlockEvaluationResult> {
  const systemInstruction = `You are a concise English writing tutor. Evaluate the single block provided.
Output ONLY a single valid JSON object. All feedback and explanations MUST be in concise Vietnamese (1-2 sentences).`;

  const prompt = `Topic: "${topic}" | Section: ${blockTitle} | Target: ${level}
Content:
"""
${blockContent}
"""

Return ONLY this JSON:
{
  "isGood": boolean,
  "feedback": "1-2 sentence Vietnamese feedback",
  "corrections": [
    {"original": "error part", "corrected": "corrected part", "explanation": "short explanation in VN"}
  ],
  "improvedVersion": "Polished native-like version of this single paragraph"
}
Constraints: corrections max 2 items (or [] if none).`;

  const raw = await callGeminiJSON<Record<string, unknown>>(prompt, {
    temperature: 0.1,
    maxOutputTokens: 800,
    thinkingBudget: 0,
    systemInstruction,
  });

  const rawCorrections = Array.isArray(raw?.['corrections']) ? (raw['corrections'] as unknown[]) : [];
  const corrections = rawCorrections.map((c) => {
    const obj = (c && typeof c === 'object' ? c : {}) as Record<string, unknown>;
    return {
      original: typeof obj['original'] === 'string' ? obj['original'] : '',
      corrected: typeof obj['corrected'] === 'string' ? obj['corrected'] : '',
      explanation: typeof obj['explanation'] === 'string' ? obj['explanation'] : '',
    };
  }).filter((c) => c.corrected.length > 0);

  return {
    isGood: typeof raw?.['isGood'] === 'boolean' ? raw['isGood'] : true,
    feedback: typeof raw?.['feedback'] === 'string' ? raw['feedback'] : 'Đoạn văn viết tốt, ngữ pháp tương đối chuẩn.',
    corrections,
    improvedVersion: typeof raw?.['improvedVersion'] === 'string' ? raw['improvedVersion'] : blockContent,
  };
}

// ─── Gemini Full Essay Evaluation (Stateless & Token-Optimized: 800-1200 Tokens) ─

export async function evaluateEssay(
  topic: string,
  promptText: string,
  essayContent: string,
  level: string = 'B1'
): Promise<WritingEvaluationResult> {
  const calculatedWords = essayContent.trim().split(/\s+/).filter(Boolean).length;

  const systemInstruction = `You are a strict, highly accurate IELTS / CEFR certified writing examiner.
Your job is to objectively and strictly evaluate the submitted essay according to official IELTS Writing Band Descriptors and CEFR levels.

IMPORTANT RULES FOR ACCURATE & STRICT GRADING:
1. DO NOT give inflated or fixed scores. Grade strictly based on actual essay quality:
   - If the essay has frequent basic grammatical errors (e.g., subject-verb agreement, plural forms, wrong verb tenses, incorrect prepositions, incorrect word forms), the Grammar score MUST be penalized heavily (e.g., 3.0 to 5.0 out of 10, corresponding to IELTS Band 4.0 - 5.0).
   - If grammar and vocabulary are full of errors, the estimatedBand MUST accurately reflect IELTS 3.5 - 4.5 and cefrLevel should be A2 or B1 (do NOT assign Band 6.0+ for error-ridden texts).
   - overallScore must be the exact mathematical average of the 4 criteria scores on a 10-point scale (1.0 to 10.0, rounded to 1 decimal place).
2. COMPLETE ERROR DETECTION:
   - Thoroughly inspect the ENTIRE essay sentence by sentence from beginning to end.
   - List ALL grammar errors in 'grammarErrors'. Do NOT skip or stop after 3 errors. Capture every single grammatical, morphological, syntactic, and structural error.
   - List ALL spelling / typo mistakes in 'spellingErrors'.
3. All feedback, explanations, and comments MUST be in natural, helpful Vietnamese.
4. Output ONLY a valid JSON object matching the requested schema. No markdown backticks, no explanations outside JSON.`;

  const prompt = `Evaluate the following English essay thoroughly and strictly.

[SUBMISSION CONTEXT]
- Topic: "${topic}"
- Target Level: ${level}
${promptText ? `- Prompt Question: "${promptText}"` : ''}

[ESSAY CONTENT]
"""
${essayContent}
"""

[EVALUATION REQUIREMENTS]
1. Grade the 4 criteria strictly on a 1.0 - 10.0 scale:
   - taskResponse (0-10): Addressing the prompt, clarity and depth of arguments & examples.
   - coherence (0-10): Paragraph organization, logical transitions, flow.
   - vocabulary (0-10): Lexical variety, precision, collocations, penalty for repetitive/incorrect words.
   - grammar (0-10): Grammatical range & accuracy. Deduct heavily for frequent basic errors!
2. Calculate overallScore = (taskResponse + coherence + vocabulary + grammar) / 4.
3. Map overallScore to real estimatedBand (e.g. "4.0 - 4.5", "5.0 - 5.5", "6.0 - 6.5", "7.0 - 7.5") and cefrLevel (e.g. "A2", "B1", "B2", "C1", "C2").
4. List ALL grammar errors across the entire text in 'grammarErrors'.
5. List ALL spelling / typo errors in 'spellingErrors'.
6. Provide a high quality native rewrite in 'nativePolish' with explanations.

Return ONLY this JSON schema:
{
  "overallScore": <calculated_number_between_1.0_and_10.0>,
  "cefrLevel": "<actual_cefr_level>",
  "estimatedBand": "<actual_ielts_band_range>",
  "wordCount": ${calculatedWords},
  "summaryFeedback": "<concise_2_to_3_sentence_honest_evaluation_in_Vietnamese>",
  "strengths": ["<strength_1_in_Vietnamese>", "<strength_2_in_Vietnamese>"],
  "weaknesses": ["<weakness_1_in_Vietnamese>", "<weakness_2_in_Vietnamese>"],
  "criteriaScores": {
    "taskResponse": { "score": <number>, "comment": "<1_sentence_Vietnamese_feedback>" },
    "coherence": { "score": <number>, "comment": "<1_sentence_Vietnamese_feedback>" },
    "vocabulary": { "score": <number>, "comment": "<1_sentence_Vietnamese_feedback>" },
    "grammar": { "score": <number>, "comment": "<1_sentence_Vietnamese_feedback>" }
  },
  "spellingErrors": [
    {
      "original": "<misspelled_word>",
      "correction": "<correct_spelling>",
      "context": "<short_phrase_context>",
      "explanation": "<short_Vietnamese_explanation>"
    }
  ],
  "grammarErrors": [
    {
      "originalSentence": "<exact_sentence_from_essay_with_error>",
      "correctedSentence": "<fully_corrected_sentence>",
      "errorType": "<Specific_error_category_such_as_Subject-verb_agreement_or_Verb_Tense_or_Gerund_Form>",
      "explanation": "<detailed_clear_explanation_in_Vietnamese_why_it_is_wrong_and_how_to_fix>"
    }
  ],
  "nativePolish": {
    "fullPolishedEssay": "<complete_native_level_essay_rewritten_fluently_and_naturally>",
    "overallImpression": "<1_to_2_sentence_Vietnamese_review_of_improvements>",
    "keyImprovements": [
      {
        "originalPart": "<original_phrase_or_sentence>",
        "polishedPart": "<upgraded_native_phrasing>",
        "explanation": "<concise_Vietnamese_explanation_of_why_the_rewrite_is_better>",
        "benefit": "<e.g._Tu_nhien_hon_or_Hoc_thuat_hon>"
      }
    ]
  }
}`;

  const raw = await callGeminiJSON<unknown>(prompt, {
    temperature: 0.1,
    maxOutputTokens: 3500,
    thinkingBudget: 0,
    systemInstruction,
  });

  return normalizeWritingEvaluation(raw, calculatedWords, level);
}

// ─── Example Topics ────────────────────────────────────────────────────────────

export const POPULAR_WRITING_TOPICS = [
  {
    title: 'Technology & AI',
    topic: 'How artificial intelligence is changing the way students learn and work',
    level: 'B2',
    category: 'Công nghệ',
    wordCount: 200,
  },
  {
    title: 'Daily Life & Habits',
    topic: 'Describe your daily morning routine and how it affects your productivity',
    level: 'A2',
    category: 'Đời sống',
    wordCount: 120,
  },
  {
    title: 'Environmental Protection',
    topic: 'Should plastic bags and single-use plastics be completely banned worldwide?',
    level: 'B2',
    category: 'Môi trường',
    wordCount: 250,
  },
  {
    title: 'Work & Career',
    topic: 'The advantages and disadvantages of remote working (working from home)',
    level: 'B1',
    category: 'Công việc',
    wordCount: 180,
  },
  {
    title: 'Travel & Culture',
    topic: 'An unforgettable travel experience and what you learned from local culture',
    level: 'B1',
    category: 'Du lịch',
    wordCount: 150,
  },
  {
    title: 'Education & Future',
    topic: 'Is a university degree still essential for achieving career success today?',
    level: 'C1',
    category: 'Giáo dục',
    wordCount: 250,
  },
];

// ─── Backend API History & Analytics Integration ──────────────────────────────

export interface SaveAiWritingHistoryRequest {
  topic: string;
  level?: string;
  writingType?: string;
  promptText?: string;
  essayContent: string;
  outlineData?: WritingOutline | null;
  feedbackData: WritingEvaluationResult;
  score?: number;
  wordCount?: number;
}

export interface AiWritingHistoryResponse {
  id: string;
  topic: string;
  level?: string;
  writingType?: string;
  promptText?: string;
  essayContent: string;
  outlineData?: WritingOutline;
  feedbackData: WritingEvaluationResult;
  score?: number;
  wordCount?: number;
  createdAt: string;
}

export interface TopMistakeItem {
  errorType: string;
  count: number;
  advice: string;
  sampleCorrections: string[];
}

export interface ScoreHistoryItem {
  id: string;
  topic: string;
  score: number;
  wordCount: number;
  createdAt: string;
}

export interface AiWritingAnalyticsResponse {
  totalEssays: number;
  averageScore: number;
  totalWords: number;
  criteriaAverages: {
    grammar: number;
    vocabulary: number;
    coherence: number;
    taskResponse: number;
  };
  topMistakes: TopMistakeItem[];
  recentScores: ScoreHistoryItem[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export async function saveWritingHistory(data: SaveAiWritingHistoryRequest): Promise<AiWritingHistoryResponse> {
  const res = await axios.post('/ai-writing/history', data);
  return res.data.data;
}

export async function getWritingHistory(page = 0, size = 10): Promise<PaginatedResponse<AiWritingHistoryResponse>> {
  const res = await axios.get('/ai-writing/history', { params: { page, size } });
  return res.data.data;
}

export async function getWritingHistoryById(id: string): Promise<AiWritingHistoryResponse> {
  const res = await axios.get(`/ai-writing/history/${id}`);
  return res.data.data;
}

export async function deleteWritingHistory(id: string): Promise<void> {
  await axios.delete(`/ai-writing/history/${id}`);
}

export async function getWritingAnalytics(): Promise<AiWritingAnalyticsResponse> {
  const res = await axios.get('/ai-writing/analytics');
  return res.data.data;
}
