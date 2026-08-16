/**
 * Vocabulary lookup via Gemini AI.
 * Supports both English → Vietnamese and Vietnamese → English lookups.
 */

import { callGeminiJSON } from './geminiHelpers';

export interface VocabularyLookupResult {
  word: string;
  partOfSpeech: string;
  pronunciation: string;
  meaning: string;
  example: string;
}

const ENGLISH_LOOKUP_PROMPT = (word: string) => `You are an English-Vietnamese dictionary expert.

Given the English word: "${word}"

Return a JSON object with:
- "word": the original English word (cleaned up if needed)
- "partOfSpeech": part of speech in English abbreviation (e.g. "adj", "n", "v", "adv", "prep", "conj")
- "pronunciation": IPA phonetic transcription (e.g. "/rɪˈzɪliənt/")
- "meaning": Vietnamese translation/meaning (concise, 1-3 words)
- "example": one natural English example sentence using the word

Respond ONLY with a valid JSON object. No markdown, no code fences, no extra text.`;

const VIETNAMESE_LOOKUP_PROMPT = (meaning: string) => `You are an English-Vietnamese dictionary expert.

Given the Vietnamese meaning: "${meaning}"

Find the most common/appropriate English word for this meaning and return a JSON object with:
- "word": the English word
- "partOfSpeech": part of speech in English abbreviation (e.g. "adj", "n", "v", "adv", "prep", "conj")
- "pronunciation": IPA phonetic transcription (e.g. "/rɪˈzɪliənt/")
- "meaning": the original Vietnamese meaning (cleaned up if needed)
- "example": one natural English example sentence using the word

Respond ONLY with a valid JSON object. No markdown, no code fences, no extra text.`;

/**
 * Lookup an English word → returns full vocabulary info including Vietnamese meaning.
 */
export async function lookupEnglishWord(
  word: string,
  signal?: AbortSignal,
): Promise<VocabularyLookupResult> {
  const trimmed = word.trim();
  if (!trimmed) throw new Error('Từ tiếng Anh không được để trống.');

  return callGeminiJSON<VocabularyLookupResult>(
    ENGLISH_LOOKUP_PROMPT(trimmed),
    signal,
  );
}

/**
 * Lookup a Vietnamese meaning → returns the matching English word and full info.
 */
export async function lookupVietnameseMeaning(
  meaning: string,
  signal?: AbortSignal,
): Promise<VocabularyLookupResult> {
  const trimmed = meaning.trim();
  if (!trimmed) throw new Error('Nghĩa tiếng Việt không được để trống.');

  return callGeminiJSON<VocabularyLookupResult>(
    VIETNAMESE_LOOKUP_PROMPT(trimmed),
    signal,
  );
}
