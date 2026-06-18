'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { FlashcardSet } from '@/store/slices/flashcardSlice';
import { getFlashcardSetById } from '@/services/flashcardData';
import flashcardService from '@/services/flashcardService';

export type TypingStatus = 'idle' | 'playing' | 'finished';
export type AnswerState = 'unanswered' | 'correct' | 'wrong' | 'skipped';

export interface TypingCard {
  id: string;
  word: string;
  meaning: string;
  pronunciation?: string;
  partOfSpeech?: string;
}

export interface TypingResult {
  card: TypingCard;
  userAnswer: string;
  answerState: AnswerState;
  timeMs: number;
}

export interface TypingStats {
  correct: number;
  wrong: number;
  skipped: number;
  totalTimeMs: number;
  avgTimeMs: number;
}

const normalizeVietnamese = (str: string): string =>
  str.trim().toLowerCase();

const isAnswerCorrect = (userAnswer: string, correctMeaning: string): boolean => {
  const userNorm = normalizeVietnamese(userAnswer);
  const correctNorm = normalizeVietnamese(correctMeaning);

  if (userNorm === correctNorm) return true;

  // Allow partial match: user answer matches one of comma-separated meanings
  const meaningParts = correctNorm.split(/[,;\/]/).map((s) => s.trim());
  return meaningParts.some((part) => userNorm === part || part.startsWith(userNorm) && userNorm.length >= 2 && part.length - userNorm.length <= 2);
};

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function useTypingGame(setId: string | null) {
  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<TypingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [status, setStatus] = useState<TypingStatus>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [results, setResults] = useState<TypingResult[]>([]);
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now());
  const [showHint, setShowHint] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch data
  useEffect(() => {
    if (!setId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    getFlashcardSetById(setId, 'all').then((set) => {
      if (set) {
        setCurrentSet(set);
        const mapped: TypingCard[] = (set.cards ?? []).map((c) => ({
          id: c.id,
          word: c.word,
          meaning: c.meaning,
          pronunciation: c.pronunciation,
          partOfSpeech: (c as any).partOfSpeech,
        }));
        setCards(shuffleArray(mapped));
      }
      setIsLoading(false);
    });
  }, [setId]);

  const currentCard = cards[currentIndex] ?? null;
  const totalCards = cards.length;
  const progressPercent = totalCards > 0 ? Math.round((currentIndex / totalCards) * 100) : 0;

  const startGame = useCallback(() => {
    setCards((prev) => shuffleArray(prev));
    setCurrentIndex(0);
    setUserInput('');
    setAnswerState('unanswered');
    setResults([]);
    setStatus('playing');
    setCardStartTime(Date.now());
    setShowHint(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const recordResult = useCallback(
    (state: AnswerState, answer: string) => {
      if (!currentCard) return;
      const elapsed = Date.now() - cardStartTime;
      const result: TypingResult = {
        card: currentCard,
        userAnswer: answer,
        answerState: state,
        timeMs: elapsed,
      };
      setResults((prev) => [...prev, result]);

      // Update card progress in backend
      if (state === 'correct') {
        flashcardService.updateCardProgress(currentCard.id, 'LEARNING').catch(console.error);
      } else if (state === 'wrong') {
        flashcardService.updateCardProgress(currentCard.id, 'UNKNOWN').catch(console.error);
      }
    },
    [currentCard, cardStartTime]
  );

  const advanceToNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalCards) {
      setStatus('finished');
    } else {
      setCurrentIndex(nextIndex);
      setUserInput('');
      setAnswerState('unanswered');
      setShowHint(false);
      setCardStartTime(Date.now());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [currentIndex, totalCards]);

  const handleSubmit = useCallback(() => {
    if (answerState !== 'unanswered' || !currentCard) return;
    if (!userInput.trim()) return;

    const correct = isAnswerCorrect(userInput, currentCard.meaning);
    const state: AnswerState = correct ? 'correct' : 'wrong';
    setAnswerState(state);
    recordResult(state, userInput);

    setTimeout(advanceToNext, 1200);
  }, [answerState, currentCard, userInput, recordResult, advanceToNext]);

  const handleSkip = useCallback(() => {
    if (answerState !== 'unanswered' || !currentCard) return;
    setAnswerState('skipped');
    recordResult('skipped', '');
    setTimeout(advanceToNext, 800);
  }, [answerState, currentCard, recordResult, advanceToNext]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSubmit();
      if (e.key === 'Tab') {
        e.preventDefault();
        handleSkip();
      }
    },
    [handleSubmit, handleSkip]
  );

  const computeStats = useCallback((): TypingStats => {
    const correct = results.filter((r) => r.answerState === 'correct').length;
    const wrong = results.filter((r) => r.answerState === 'wrong').length;
    const skipped = results.filter((r) => r.answerState === 'skipped').length;
    const totalTimeMs = results.reduce((s, r) => s + r.timeMs, 0);
    const avgTimeMs = results.length > 0 ? Math.round(totalTimeMs / results.length) : 0;
    return { correct, wrong, skipped, totalTimeMs, avgTimeMs };
  }, [results]);

  const restartGame = useCallback(() => {
    setCurrentIndex(0);
    setUserInput('');
    setAnswerState('unanswered');
    setResults([]);
    setStatus('idle');
    setShowHint(false);
    setCards((prev) => shuffleArray(prev));
  }, []);

  return {
    // Data
    currentSet,
    cards,
    isLoading,
    // Game state
    status,
    currentIndex,
    currentCard,
    totalCards,
    progressPercent,
    userInput,
    answerState,
    results,
    showHint,
    inputRef,
    // Actions
    setUserInput,
    setShowHint,
    startGame,
    handleSubmit,
    handleSkip,
    handleKeyDown,
    computeStats,
    restartGame,
  };
}
