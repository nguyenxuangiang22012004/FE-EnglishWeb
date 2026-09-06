'use client';
// hooks/useAIListening.ts
// Thay thế useDictation.ts

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  ListeningLesson,
  ListeningQuestion,
  QuizResult,
  CEFRLevel,
  generateListeningLesson,
  scoreQuiz,
  calcScore,
  getEnglishVoices,
  saveListeningHistory,
  updateListeningHistory,
  getListeningHistoryById
} from '@/services/aiListening';
import { useRouter, useSearchParams } from 'next/navigation';

export type ListeningStatus =
  | 'idle'        // màn hình setup
  | 'generating'  // đang gọi Gemini
  | 'ready'       // bài nghe sẵn sàng, chưa làm quiz
  | 'quiz'        // đang làm quiz
  | 'submitted'   // đã nộp, xem kết quả
  | 'error';

export interface UseAIListeningReturn {
  // State
  status: ListeningStatus;
  errorMsg: string;
  lesson: ListeningLesson | null;
  userAnswers: Record<number, string>;
  quizResults: QuizResult[];
  totalScore: number;
  isSpeaking: boolean;
  isPaused: boolean;
  playCount: number;
  speechProgress: number; // 0-100
  speechCurrentTime: number;
  speechDuration: number;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceIndex: number;
  playbackRate: number;
  showTranscript: boolean;
  showBilingual: boolean;
  answeredCount: number;

  // Setup form state (lifted so components can read)
  topic: string;
  level: CEFRLevel;
  questionCount: number;
  voiceIndex: number;

  // Actions
  setTopic: (v: string) => void;
  setLevel: (v: CEFRLevel) => void;
  setQuestionCount: (v: number) => void;
  setVoiceIndex: (v: number) => void;
  setPlaybackRate: (v: number) => void;
  generate: () => Promise<void>;
  playPause: () => void;
  stopSpeech: () => void;
  seekTo: (progressPercent: number) => void;
  setAnswer: (questionId: number, answer: string) => void;
  submitQuiz: () => void;
  retryQuiz: () => void;
  startQuiz: () => void;
  resetAll: () => void;
  toggleTranscript: () => void;
  toggleBilingual: () => void;
  previewVoice: () => void;
  loadHistoryReview: (historyItem: any) => void;
}

export function useAIListening(): UseAIListeningReturn {
  const [status, setStatus] = useState<ListeningStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [lesson, setLesson] = useState<ListeningLesson | null>(null);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [speechProgress, setSpeechProgress] = useState(0);
  const [speechCurrentTime, setSpeechCurrentTime] = useState(0);
  const [speechDuration, setSpeechDuration] = useState(0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showBilingual, setShowBilingual] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<CEFRLevel>('B1');
  const [questionCount, setQuestionCount] = useState(5);
  const [voiceIndex, setVoiceIndex] = useState(0);

  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speechStartRef = useRef<number>(0);
  const estimatedDurRef = useRef<number>(0);
  const charIndexRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);

  // Load voices
  useEffect(() => {
    const load = () => {
      const v = getEnglishVoices();
      setAvailableVoices(v);
    };
    load();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = load;
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  // Load from URL ID
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      const id = searchParams?.get('id');
      if (id) {
        setStatus('generating');
        getListeningHistoryById(id).then(res => {
          setTopic(res.topic);
          setLevel(res.level);
          setLesson(res.lessonData);
          setCurrentHistoryId(res.id);
          
          if (res.userAnswersData && Object.keys(res.userAnswersData).length > 0) {
             setUserAnswers(res.userAnswersData);
             setTotalScore(res.score);
             setQuizResults(scoreQuiz(res.lessonData.questions, res.userAnswersData));
             setStatus('submitted');
          } else {
             setStatus('ready');
          }
        }).catch(err => {
          console.error('Failed to load lesson from url id:', err);
          setStatus('idle');
        });
      }
    }
  }, [searchParams]);

  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const estimateDuration = useCallback((text: string, rate: number): number => {
    const words = text.trim().split(/\s+/).length;
    // average English TTS ~150 wpm at rate=1
    return (words / (150 * rate)) * 60;
  }, []);

  const startProgressTimer = useCallback((durationSec: number, startOffset: number = 0) => {
    clearProgressTimer();
    speechStartRef.current = Date.now() - (startOffset * 1000);
    estimatedDurRef.current = durationSec;
    setSpeechDuration(durationSec);
    setSpeechProgress(durationSec > 0 ? (startOffset / durationSec) * 100 : 0);
    setSpeechCurrentTime(startOffset);

    progressTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - speechStartRef.current) / 1000;
      const pct = Math.min((elapsed / durationSec) * 100, 100);
      setSpeechProgress(pct);
      setSpeechCurrentTime(Math.min(elapsed, durationSec));
    }, 200);
  }, [clearProgressTimer]);

  const speakLesson = useCallback((passageText: string, rate: number, vIdx: number, startIndex: number = 0) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    clearProgressTimer();

    if (startIndex === 0) {
      charIndexRef.current = 0;
    }

    const textToSpeak = startIndex > 0 ? passageText.substring(startIndex) : passageText;
    const utter = new SpeechSynthesisUtterance(textToSpeak);
    utter.lang = 'en-US';
    utter.rate = rate;

    const voices = getEnglishVoices();
    if (voices.length && vIdx < voices.length) {
      utter.voice = voices[vIdx];
    }

    utter.onboundary = (e) => {
      charIndexRef.current = startIndex + e.charIndex;
    };

    utter.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      if (startIndex === 0) {
        setPlayCount((p) => p + 1);
      }
      const totalDur = estimateDuration(passageText, rate);
      const startOffset = passageText.length > 0 ? (startIndex / passageText.length) * totalDur : 0;
      startProgressTimer(totalDur, startOffset);
    };

    utter.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      clearProgressTimer();
      setSpeechProgress(100);
      setSpeechCurrentTime(estimatedDurRef.current);
    };

    utter.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      clearProgressTimer();
    };

    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [clearProgressTimer, estimateDuration, startProgressTimer]);

  const playPause = useCallback(() => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;

    if (synth.speaking && !isPaused) {
      synth.pause();
      setIsPaused(true);
      clearProgressTimer();
      return;
    }

    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      // Resume timer from current position
      startProgressTimer(estimatedDurRef.current, speechCurrentTime);
      return;
    }

    // Not speaking at all — start fresh
    if (lesson) {
      speakLesson(lesson.passage, playbackRate, voiceIndex);
    }
  }, [isPaused, lesson, playbackRate, voiceIndex, speakLesson, clearProgressTimer, startProgressTimer, speechCurrentTime]);

  const stopSpeech = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (utterRef.current) {
      utterRef.current.onend = null;
      utterRef.current.onerror = null;
    }
    window.speechSynthesis.cancel();
    clearProgressTimer();
    setIsSpeaking(false);
    setIsPaused(false);
    setSpeechProgress(0);
    setSpeechCurrentTime(0);
    charIndexRef.current = 0;
  }, [clearProgressTimer]);

  const generate = useCallback(async () => {
    if (!topic.trim()) return;
    setStatus('generating');
    setErrorMsg('');
    stopSpeech();
    setLesson(null);
    setCurrentHistoryId(null);
    setUserAnswers({});
    setQuizResults([]);
    setTotalScore(0);
    setShowTranscript(false);
    setPlayCount(0);

    try {
      const result = await generateListeningLesson(topic, level, questionCount);
      setLesson(result);
      setStatus('ready');

      // Lưu ngay vào lịch sử với điểm số = 0, chưa có câu trả lời
      saveListeningHistory({
        topic,
        level,
        lessonData: result,
        userAnswersData: {},
        score: 0,
      }).then(res => {
        setCurrentHistoryId(res.id);
        if (typeof window !== 'undefined') {
          window.history.pushState({}, '', `?id=${res.id}`);
        }
      }).catch(err => {
        console.error('Failed to save initial listening history:', err);
      });

      // Không auto-play — người dùng tự bấm Play
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định.';
      setErrorMsg(msg);
      setStatus('error');
    }
  }, [topic, level, questionCount, stopSpeech, speakLesson, playbackRate, voiceIndex]);

  const setAnswer = useCallback((questionId: number, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }, []);

  const submitQuiz = useCallback(() => {
    if (!lesson) return;
    const results = scoreQuiz(lesson.questions, userAnswers);
    const score = calcScore(results);
    setQuizResults(results);
    setTotalScore(score);
    setStatus('submitted');
    stopSpeech();

    // Cập nhật lại lịch sử đã lưu trước đó
    if (currentHistoryId) {
      updateListeningHistory(currentHistoryId, {
        userAnswersData: userAnswers,
        score,
      }).catch((err) => {
        console.error('Failed to update listening history:', err);
      });
    }
  }, [lesson, userAnswers, stopSpeech, currentHistoryId]);

  const retryQuiz = useCallback(() => {
    setUserAnswers({});
    setQuizResults([]);
    setTotalScore(0);
    setStatus('quiz');
  }, []);

  // Chuyển từ 'ready' sang 'quiz' mà không cần expose setStatus ra ngoài
  const startQuiz = useCallback(() => {
    setStatus('quiz');
  }, []);

  const resetAll = useCallback(() => {
    stopSpeech();
    setStatus('idle');
    setLesson(null);
    setCurrentHistoryId(null);
    setUserAnswers({});
    setQuizResults([]);
    setTotalScore(0);
    setErrorMsg('');
    setShowTranscript(false);
    setShowBilingual(false);
    setPlayCount(0);
    setSpeechProgress(0);
    setSpeechCurrentTime(0);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', window.location.pathname);
    }
  }, [stopSpeech]);

  const toggleTranscript = useCallback(() => {
    setShowTranscript((p) => !p);
  }, []);

  const toggleBilingual = useCallback(() => {
    setShowBilingual((p) => !p);
  }, []);

  const loadHistoryReview = useCallback((historyItem: any) => {
    stopSpeech();
    setTopic(historyItem.topic);
    setLevel(historyItem.level);
    setLesson(historyItem.lessonData);
    setUserAnswers(historyItem.userAnswersData);
    setTotalScore(historyItem.score);
    // Tính lại quizResults để hiển thị đúng/sai
    if (historyItem.lessonData && historyItem.userAnswersData) {
      setQuizResults(scoreQuiz(historyItem.lessonData.questions, historyItem.userAnswersData));
    } else {
      setQuizResults([]);
    }
    setStatus('submitted');
    setShowTranscript(false);
    setPlayCount(0);
    setSpeechProgress(0);
    setSpeechCurrentTime(0);
  }, [stopSpeech]);

  const previewVoice = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance('Hello! This is a preview of the selected voice.');
    const voices = getEnglishVoices();
    if (voices.length && voiceIndex < voices.length) {
      u.voice = voices[voiceIndex];
    }
    u.rate = playbackRate;
    window.speechSynthesis.speak(u);
  }, [voiceIndex, playbackRate]);

  const seekTo = useCallback((pct: number) => {
    if (!lesson) return;
    const passage = lesson.passage;
    const clampedPct = Math.max(0, Math.min(100, pct));
    const charIndex = Math.floor((clampedPct / 100) * passage.length);
    const timeSec = (clampedPct / 100) * estimatedDurRef.current;

    // Cập nhật UI ngay lập tức
    setSpeechProgress(clampedPct);
    setSpeechCurrentTime(timeSec);
    charIndexRef.current = charIndex;

    if (isSpeaking || isPaused) {
      // Hủy utterance cũ, speak lại từ charIndex mới
      if (utterRef.current) {
        utterRef.current.onend = null;
        utterRef.current.onerror = null;
      }
      window.speechSynthesis.cancel();
      clearProgressTimer();
      setIsPaused(false);
      setTimeout(() => speakLesson(passage, playbackRate, voiceIndex, charIndex), 80);
    }
  }, [lesson, isSpeaking, isPaused, playbackRate, voiceIndex, speakLesson, clearProgressTimer]);

  const handleSetPlaybackRate = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (isSpeaking && lesson) {
      const currentIndex = charIndexRef.current;
      if (utterRef.current) {
        utterRef.current.onend = null;
        utterRef.current.onerror = null;
      }
      window.speechSynthesis.cancel();
      setTimeout(() => speakLesson(lesson.passage, rate, voiceIndex, currentIndex), 100);
    }
  }, [isSpeaking, lesson, speakLesson, voiceIndex]);

  const handleSetVoiceIndex = useCallback((idx: number) => {
    setVoiceIndex(idx);
    setSelectedVoiceIndex(idx);
  }, []);

  const answeredCount = Object.keys(userAnswers).length;

  return {
    status,
    errorMsg,
    lesson,
    userAnswers,
    quizResults,
    totalScore,
    isSpeaking,
    isPaused,
    playCount,
    speechProgress,
    speechCurrentTime,
    speechDuration,
    availableVoices,
    selectedVoiceIndex,
    playbackRate,
    showTranscript,
    showBilingual,
    answeredCount,
    topic,
    level,
    questionCount,
    voiceIndex,
    setTopic,
    setLevel,
    setQuestionCount,
    setVoiceIndex: handleSetVoiceIndex,
    setPlaybackRate: handleSetPlaybackRate,
    generate,
    playPause,
    stopSpeech,
    seekTo,
    setAnswer,
    submitQuiz,
    retryQuiz,
    startQuiz,
    resetAll,
    toggleTranscript,
    toggleBilingual,
    previewVoice,
    loadHistoryReview,
  };
}