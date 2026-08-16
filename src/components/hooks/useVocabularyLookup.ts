/**
 * Hook to manage auto-detect vocabulary lookup logic.
 * Handles onBlur triggers for English word & Vietnamese meaning fields,
 * tracks loading state per row, and supports abort on rapid changes.
 */

import { useCallback, useRef, useState } from 'react';
import { message } from 'antd';
import {
  lookupEnglishWord,
  lookupVietnameseMeaning,
  VocabularyLookupResult,
} from '@/services/vocabularyLookupService';
import { getGeminiKey } from '@/services/geminiHelpers';

interface FlashcardRow {
  id: number;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
}

interface UseVocabularyLookupParams {
  rows: FlashcardRow[];
  updateField: (id: number, field: keyof FlashcardRow, value: string) => void;
}

export function useVocabularyLookup({
  rows,
  updateField,
}: UseVocabularyLookupParams) {
  const [loadingRows, setLoadingRows] = useState<Set<number>>(new Set());
  const abortControllers = useRef<Map<number, AbortController>>(new Map());

  const cancelPending = useCallback((rowId: number) => {
    const existing = abortControllers.current.get(rowId);
    if (existing) {
      existing.abort();
      abortControllers.current.delete(rowId);
    }
  }, []);

  const startLoading = useCallback((rowId: number) => {
    setLoadingRows((prev) => new Set(prev).add(rowId));
  }, []);

  const stopLoading = useCallback((rowId: number) => {
    setLoadingRows((prev) => {
      const next = new Set(prev);
      next.delete(rowId);
      return next;
    });
  }, []);

  /**
   * Fill empty fields from lookup result, preserving user-entered values.
   */
  const applyResult = useCallback(
    (rowId: number, result: VocabularyLookupResult, sourceField: 'word' | 'meaning') => {
      const row = rows.find((r) => r.id === rowId);
      if (!row) return;

      const fieldsToFill: (keyof VocabularyLookupResult)[] = [
        'word',
        'partOfSpeech',
        'pronunciation',
        'meaning',
        'example',
      ];

      for (const field of fieldsToFill) {
        // Skip the field the user typed in
        if (field === sourceField) continue;
        // Only fill if the current value is empty
        if (!row[field]?.trim() && result[field]?.trim()) {
          updateField(rowId, field, result[field].trim());
        }
      }
    },
    [rows, updateField],
  );

  /**
   * Triggered when user leaves the "English word" field.
   */
  const handleWordBlur = useCallback(
    async (rowId: number, word: string) => {
      const trimmed = word.trim();
      if (!trimmed) return;

      // Check if API key exists
      if (!getGeminiKey()) {
        message.warning('Chưa có Gemini API Key. Vào ⚙️ Cài đặt để thêm key.');
        return;
      }

      // Cancel any pending request for this row
      cancelPending(rowId);

      const controller = new AbortController();
      abortControllers.current.set(rowId, controller);

      startLoading(rowId);
      try {
        const result = await lookupEnglishWord(trimmed, controller.signal);
        applyResult(rowId, result, 'word');
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const errorMsg = err instanceof Error ? err.message : 'Lỗi tra cứu từ vựng';
        message.error(errorMsg);
      } finally {
        stopLoading(rowId);
        abortControllers.current.delete(rowId);
      }
    },
    [cancelPending, startLoading, stopLoading, applyResult],
  );

  /**
   * Triggered when user leaves the "Vietnamese meaning" field.
   */
  const handleMeaningBlur = useCallback(
    async (rowId: number, meaning: string) => {
      const trimmed = meaning.trim();
      if (!trimmed) return;

      if (!getGeminiKey()) {
        message.warning('Chưa có Gemini API Key. Vào ⚙️ Cài đặt để thêm key.');
        return;
      }

      cancelPending(rowId);

      const controller = new AbortController();
      abortControllers.current.set(rowId, controller);

      startLoading(rowId);
      try {
        const result = await lookupVietnameseMeaning(trimmed, controller.signal);
        applyResult(rowId, result, 'meaning');
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const errorMsg = err instanceof Error ? err.message : 'Lỗi tra cứu từ vựng';
        message.error(errorMsg);
      } finally {
        stopLoading(rowId);
        abortControllers.current.delete(rowId);
      }
    },
    [cancelPending, startLoading, stopLoading, applyResult],
  );

  return {
    handleWordBlur,
    handleMeaningBlur,
    loadingRows,
  };
}
