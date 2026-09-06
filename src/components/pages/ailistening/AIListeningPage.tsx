'use client';
// components/pages/listening/AIListeningPage.tsx
// Thay thế DictationPage.tsx — luyện nghe AI với Gemini

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Headphones, Play, Pause, RotateCcw, ChevronRight,
  Sparkles, Volume2, VolumeX, Eye, EyeOff, Settings,
  CheckCircle2, XCircle, AlertCircle, ArrowLeft, Mic,
  SkipBack, SkipForward,
} from 'lucide-react';
import { useAIListening } from '@/components/hooks/useAIListening';
import {
  EXAMPLE_TOPICS, CEFRLevel, ListeningQuestion, QuizResult,
  getListeningHistory, AiListeningHistoryResponse, PaginatedResponse
} from '@/services/aiListening';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtTime(sec: number): string {
  const s = Math.round(Math.max(0, sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const LEVEL_LABELS: Record<CEFRLevel, string> = {
  A2: 'A2 · Sơ cấp',
  B1: 'B1 · Trung cấp',
  B2: 'B2 · Trung cao',
  C1: 'C1 · Nâng cao',
};

const LEVEL_COLORS: Record<CEFRLevel, string> = {
  A2: 'text-accent-emerald border-accent-emerald/30 bg-accent-emerald/10',
  B1: 'text-accent-cyan border-accent-cyan/30 bg-accent-cyan/10',
  B2: 'text-accent-indigo-light border-accent-indigo/30 bg-accent-indigo/10',
  C1: 'text-accent-rose border-accent-rose/30 bg-accent-rose/10',
};

// ─── AudioPlayer ───────────────────────────────────────────────────────────────

const AudioPlayer: React.FC<{
  isSpeaking: boolean;
  isPaused: boolean;
  playCount: number;
  progress: number;
  currentTime: number;
  duration: number;
  playbackRate: number;
  onPlayPause: () => void;
  onStop: () => void;
  onSetRate: (r: number) => void;
  onSeek: (pct: number) => void;
}> = ({
  isSpeaking, isPaused, playCount, progress,
  currentTime, duration, playbackRate,
  onPlayPause, onStop, onSetRate, onSeek,
}) => {
    const isActive = isSpeaking || isPaused;
    const rates = [0.75, 1, 1.25, 1.5];

    // ── Seek logic ────────────────────────────────────────────────
    const trackRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const [isHoveringTrack, setIsHoveringTrack] = useState(false);

    const getPctFromEvent = useCallback((clientX: number): number => {
      if (!trackRef.current) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const raw = (clientX - rect.left) / rect.width;
      return Math.max(0, Math.min(100, raw * 100));
    }, []);

    const handleTrackMouseDown = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      onSeek(getPctFromEvent(e.clientX));
    }, [onSeek, getPctFromEvent]);

    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current) return;
        onSeek(getPctFromEvent(e.clientX));
      };
      const handleMouseUp = () => {
        isDraggingRef.current = false;
      };
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [onSeek, getPctFromEvent]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (duration <= 0) return;
        const delta = (5 / duration) * 100;
        onSeek(Math.min(100, progress + delta));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (duration <= 0) return;
        const delta = (5 / duration) * 100;
        onSeek(Math.max(0, progress - delta));
      }
    }, [duration, progress, onSeek]);

    return (
      <div className="glass-card p-5 border border-white/[0.08] space-y-4">
        {/* Play button + progress */}
        <div className="flex items-center gap-4">
          {/* Skip -5s | Play | Skip +5s */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => duration > 0 && onSeek(Math.max(0, progress - (5 / duration) * 100))}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] transition-all"
              title="Lùi 5 giây (←)"
              aria-label="Lùi 5 giây"
            >
              <SkipBack size={16} />
            </button>
            <button
              onClick={onPlayPause}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)' }}
              aria-label={isActive && !isPaused ? 'Tạm dừng' : 'Phát'}
            >
              {isActive && !isPaused
                ? <Pause size={22} className="text-white" />
                : <Play size={22} className="text-white ml-0.5" />
              }
            </button>
            <button
              onClick={() => duration > 0 && onSeek(Math.min(100, progress + (5 / duration) * 100))}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] transition-all"
              title="Tiến 5 giây (→)"
              aria-label="Tiến 5 giây"
            >
              <SkipForward size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-2">
            {/* Seek track */}
            <div className="relative flex items-center group">
              <div
                ref={trackRef}
                role="slider"
                aria-label="Tua audio"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
                tabIndex={0}
                className="relative flex-1 h-2 rounded-full cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo/60"
                style={{ background: 'rgba(255,255,255,0.07)' }}
                onMouseDown={handleTrackMouseDown}
                onMouseEnter={() => setIsHoveringTrack(true)}
                onMouseLeave={() => setIsHoveringTrack(false)}
                onKeyDown={handleKeyDown}
              >
                {/* Filled bar */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-100"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #6366f1, #22d3ee)',
                  }}
                />
                {/* Thumb */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg transition-opacity duration-150 pointer-events-none ${
                    isHoveringTrack || isDraggingRef.current ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  style={{ left: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Tốc độ:</span>
          <div className="flex gap-1.5">
            {rates.map((r) => (
              <button
                key={r}
                onClick={() => onSetRate(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${playbackRate === r
                  ? 'bg-accent-indigo/20 text-accent-indigo-light border border-accent-indigo/40'
                  : 'glass-card border border-white/[0.07] text-slate-400 hover:text-slate-200'
                  }`}
              >
                {r}×
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Tách đoạn văn thành mảng câu theo dấu kết câu */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ─── TranscriptPanel ──────────────────────────────────────────────────────────

const TranscriptPanel: React.FC<{
  passage: string;
  passageVi: string;
  show: boolean;
  showBilingual: boolean;
  onToggle: () => void;
  onToggleBilingual: () => void;
}> = ({ passage, passageVi, show, showBilingual, onToggle, onToggleBilingual }) => {
  const hasVi = Boolean(passageVi);
  const enSentences = splitSentences(passage);
  const viSentences = splitSentences(passageVi);

  return (
    <div>
      {/* Toggle row */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 text-xs text-accent-indigo-light hover:text-accent-cyan transition-colors py-1"
        >
          {show ? <EyeOff size={13} /> : <Eye size={13} />}
          {show ? 'Ẩn nội dung bài nghe' : 'Hiện nội dung bài nghe'}
        </button>

        {show && hasVi && (
          <button
            onClick={onToggleBilingual}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-all ${
              showBilingual
                ? 'bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan'
                : 'glass-card border-white/[0.08] text-slate-400 hover:text-slate-200'
            }`}
          >
            🌐 Song ngữ
          </button>
        )}
      </div>

      {show && (
        <div className="mt-2 p-4 glass-card border border-accent-indigo/15 rounded-xl animate-fadeIn space-y-1">
          <p className="text-xs font-semibold text-accent-indigo-light mb-3 uppercase tracking-wider">
            📝 Transcript
          </p>

          {showBilingual && hasVi ? (
            // ─ Song ngữ: từng cặp câu EN + VI ─
            <div className="space-y-3">
              {enSentences.map((en, i) => (
                <div key={i} className="space-y-0.5">
                  <p className="text-slate-200 leading-relaxed text-sm">{en}</p>
                  {viSentences[i] && (
                    <p className="text-accent-cyan/75 leading-relaxed text-xs italic pl-2 border-l-2 border-accent-cyan/25">
                      {viSentences[i]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // ─ Chỉ tiếng Anh ─
            <p className="text-slate-200 leading-relaxed text-sm">{passage}</p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── QuizSection ──────────────────────────────────────────────────────────────

const QuizSection: React.FC<{
  questions: ListeningQuestion[];
  userAnswers: Record<number, string>;
  results: QuizResult[];
  isSubmitted: boolean;
  onAnswer: (id: number, ans: string) => void;
  onSubmit: () => void;
  onRetry: () => void;
  answeredCount: number;
}> = ({
  questions, userAnswers, results, isSubmitted,
  onAnswer, onSubmit, onRetry, answeredCount,
}) => {
    const resultMap = new Map(results.map((r) => [r.questionId, r]));

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-display font-bold text-slate-100 flex items-center gap-2">
            📋 Câu hỏi trắc nghiệm
          </h2>
          {!isSubmitted && (
            <span className="text-xs text-slate-500">
              <span className={answeredCount === questions.length ? 'text-accent-emerald font-semibold' : 'text-slate-300'}>
                {answeredCount}
              </span>
              /{questions.length} đã trả lời
            </span>
          )}
          {isSubmitted && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 glass-card border border-white/[0.08] text-slate-300 text-xs font-medium rounded-lg hover:bg-white/[0.07] transition-all"
            >
              <RotateCcw size={12} />
              Làm lại
            </button>
          )}
        </div>

        {questions.map((q, qi) => {
          const res = resultMap.get(q.id);
          const userAns = userAnswers[q.id];

          return (
            <div key={q.id} className="glass-card border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="p-4 pb-3">
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-500 mt-0.5 flex-shrink-0">
                    {qi + 1}.
                  </span>
                  <p className="text-sm text-slate-200 font-medium leading-relaxed">{q.question}</p>
                  {isSubmitted && res && (
                    <span className="flex-shrink-0 ml-auto">
                      {res.correct
                        ? <CheckCircle2 size={16} className="text-accent-emerald" />
                        : <XCircle size={16} className="text-accent-rose" />
                      }
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const letter = opt[0]; // "A", "B", "C", "D"
                    const isSelected = userAns === letter;
                    const isCorrect = letter === q.answer;

                    let optClass = 'glass-card border border-white/[0.07] text-slate-300 hover:border-white/[0.18] hover:text-slate-100';

                    if (isSubmitted) {
                      if (isCorrect) {
                        optClass = 'bg-accent-emerald/10 border border-accent-emerald/40 text-accent-emerald';
                      } else if (isSelected && !isCorrect) {
                        optClass = 'bg-accent-rose/10 border border-accent-rose/40 text-accent-rose';
                      } else {
                        optClass = 'border border-white/[0.04] text-slate-500';
                      }
                    } else if (isSelected) {
                      optClass = 'bg-accent-indigo/15 border border-accent-indigo/50 text-accent-indigo-light';
                    }

                    return (
                      <button
                        key={letter}
                        disabled={isSubmitted}
                        onClick={() => onAnswer(q.id, letter)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${optClass}`}
                      >
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${isSubmitted
                          ? isCorrect ? 'bg-accent-emerald/20' : isSelected ? 'bg-accent-rose/20' : 'bg-white/[0.05]'
                          : isSelected ? 'bg-accent-indigo/30' : 'bg-white/[0.08]'
                          }`}>
                          {letter}
                        </span>
                        <span className="flex-1">{opt.slice(3)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explanation */}
              {isSubmitted && q.explanation && (
                <div className="px-4 pb-3 pt-0">
                  <div className="p-3 bg-accent-indigo/5 border border-accent-indigo/15 rounded-lg">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <span className="text-accent-indigo-light font-semibold">💡 Giải thích: </span>
                      {q.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!isSubmitted && (
          <button
            onClick={onSubmit}
            disabled={answeredCount < questions.length}
            className="w-full py-3.5 bg-gradient-to-r from-accent-indigo to-accent-cyan text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            Nộp bài ({answeredCount}/{questions.length})
          </button>
        )}
      </div>
    );
  };

// ─── ScoreCard ────────────────────────────────────────────────────────────────

const ScoreCard: React.FC<{
  score: number;
  results: QuizResult[];
  questions: ListeningQuestion[];
}> = ({ score, results, questions }) => {
  const correct = results.filter((r) => r.correct).length;
  const scoreColor =
    score >= 80 ? 'text-accent-emerald'
      : score >= 50 ? 'text-accent-amber'
        : 'text-accent-rose';

  const label =
    score >= 80 ? '🎉 Xuất sắc!'
      : score >= 50 ? '💪 Khá tốt!'
        : '📚 Cần luyện thêm!';

  return (
    <div className="glass-card p-5 border border-white/[0.08] text-center space-y-3">
      <div className={`text-5xl font-display font-bold ${scoreColor}`}>{score}%</div>
      <div className="text-slate-400 text-sm">{label}</div>
      <div className="flex justify-center gap-6 text-sm pt-2">
        <div className="space-y-0.5">
          <div className="text-xl font-display font-bold text-accent-emerald">{correct}</div>
          <div className="text-xs text-slate-400">Đúng</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-xl font-display font-bold text-accent-rose">{results.length - correct}</div>
          <div className="text-xs text-slate-400">Sai</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-xl font-display font-bold text-slate-400">{results.length}</div>
          <div className="text-xs text-slate-400">Tổng</div>
        </div>
      </div>
    </div>
  );
};

// ─── SetupScreen ──────────────────────────────────────────────────────────────

const SetupScreen: React.FC<{
  topic: string;
  level: CEFRLevel;
  questionCount: number;
  voiceIndex: number;
  availableVoices: SpeechSynthesisVoice[];
  isLoading: boolean;
  onSetTopic: (v: string) => void;
  onSetLevel: (v: CEFRLevel) => void;
  onSetQuestionCount: (v: number) => void;
  onSetVoiceIndex: (v: number) => void;
  onGenerate: () => void;
  onPreviewVoice: () => void;
}> = ({
  topic, level, questionCount, voiceIndex, availableVoices,
  isLoading, onSetTopic, onSetLevel, onSetQuestionCount,
  onSetVoiceIndex, onGenerate, onPreviewVoice,
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Hero */}
        <div className="text-center space-y-3 py-4">
          <div
            className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)' }}
          >
            <Headphones size={36} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-100 mb-2">
              Luyện Nghe AI
            </h1>
            <p className="text-slate-400 max-w-sm mx-auto leading-relaxed text-sm">
              AI tạo bài nghe theo chủ đề bạn chọn, đọc to bằng giọng tổng hợp, rồi ra câu hỏi trắc nghiệm để kiểm tra.
            </p>
          </div>
        </div>

        {/* Topic input */}
        <div className="glass-card p-5 border border-white/[0.08] space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <Sparkles size={14} className="text-accent-indigo-light" />
              Chủ đề bài nghe
            </label>
            <textarea
              ref={textareaRef}
              value={topic}
              onChange={(e) => onSetTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && topic.trim() && !isLoading) {
                  e.preventDefault();
                  onGenerate();
                }
              }}
              rows={2}
              placeholder="Ví dụ: Daily life of a barista in New York, History of the internet..."
              className="w-full px-4 py-3 glass-input rounded-xl text-slate-200 placeholder-slate-500 text-sm leading-relaxed resize-none focus:outline-none focus:border-accent-indigo/50"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {/* Example topics */}
          <div>
            <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Gợi ý nhanh</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_TOPICS.map((ex) => (
                <button
                  key={ex.topic}
                  onClick={() => { onSetTopic(ex.topic); onSetLevel(ex.level); }}
                  disabled={isLoading}
                  className="px-3 py-1.5 glass-card border border-white/[0.07] rounded-lg text-xs text-slate-300 hover:border-accent-indigo/30 hover:text-accent-indigo-light transition-all"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="glass-card p-5 border border-white/[0.07] space-y-4">
          <p className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Settings size={14} className="text-slate-400" />
            Cài đặt
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Cấp độ (CEFR)</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['A2', 'B1', 'B2', 'C1'] as CEFRLevel[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => onSetLevel(l)}
                    disabled={isLoading}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${level === l
                      ? `${LEVEL_COLORS[l]}`
                      : 'border-white/[0.07] text-slate-500 hover:text-slate-300 hover:border-white/[0.15]'
                      }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1.5">{LEVEL_LABELS[level]}</p>
            </div>

            {/* Question count */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Số câu hỏi</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[3, 5, 7].map((n) => (
                  <button
                    key={n}
                    onClick={() => onSetQuestionCount(n)}
                    disabled={isLoading}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${questionCount === n
                      ? 'bg-accent-indigo/15 text-accent-indigo-light border-accent-indigo/40'
                      : 'border-white/[0.07] text-slate-500 hover:text-slate-300 hover:border-white/[0.15]'
                      }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1.5">{questionCount} câu trắc nghiệm</p>
            </div>
          </div>

          {/* Voice selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <Mic size={11} />
              Giọng đọc (Web Speech API)
            </label>
            {availableVoices.length > 0 ? (
              <div className="flex gap-2">
                <select
                  value={voiceIndex}
                  onChange={(e) => onSetVoiceIndex(Number(e.target.value))}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-800 text-xs"
                >
                  {availableVoices.map((v, i) => (
                    <option key={i} value={i}>
                      {v.name.replace(/Microsoft |Google |Apple /g, '')} ({v.lang})
                    </option>
                  ))}
                </select>
                <button
                  onClick={onPreviewVoice}
                  className="px-3 py-2 glass-card border border-white/[0.08] text-slate-300 rounded-xl text-xs hover:bg-white/[0.07] transition-all flex-shrink-0"
                >
                  ▶ Thử
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Giọng mặc định của trình duyệt</p>
            )}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={onGenerate}
          disabled={isLoading || !topic.trim()}
          className="w-full py-4 bg-gradient-to-r from-accent-indigo to-accent-cyan text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Đang tạo bài nghe...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Tạo bài nghe với AI</span>
            </>
          )}
        </button>

        {/* How it works */}
        <div className="glass-card p-4 border border-white/[0.05] space-y-2">
          <p className="text-xs font-semibold text-accent-indigo-light">📖 Cách hoạt động</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-400">
            <span>✨ AI viết đoạn văn tiếng Anh</span>
            <span>🔊 TTS đọc to bài nghe</span>
            <span>📝 Làm trắc nghiệm kiểm tra</span>
            <span>📊 Xem điểm và giải thích</span>
          </div>
        </div>
      </div>
    );
  };

// ─── ReadyScreen ──────────────────────────────────────────────────────────────

const ReadyScreen: React.FC<{
  lesson: NonNullable<ReturnType<typeof useAIListening>['lesson']>;
  isSpeaking: boolean;
  isPaused: boolean;
  playCount: number;
  progress: number;
  currentTime: number;
  duration: number;
  playbackRate: number;
  showTranscript: boolean;
  showBilingual: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onSetRate: (r: number) => void;
  onSeek: (pct: number) => void;
  onToggleTranscript: () => void;
  onToggleBilingual: () => void;
  onStartQuiz: () => void;
  onReset: () => void;
}> = ({
  lesson, isSpeaking, isPaused, playCount, progress,
  currentTime, duration, playbackRate, showTranscript, showBilingual,
  onPlayPause, onStop, onSetRate, onSeek, onToggleTranscript, onToggleBilingual, onStartQuiz, onReset,
}) => (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="glass-card p-4 border border-accent-emerald/20 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-display font-bold text-slate-100 leading-snug">
              {lesson.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{lesson.topic}</p>
          </div>
          <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${LEVEL_COLORS[lesson.level]}`}>
            {lesson.level}
          </span>
        </div>
      </div>

      {/* Audio player */}
      <AudioPlayer
        isSpeaking={isSpeaking}
        isPaused={isPaused}
        playCount={playCount}
        progress={progress}
        currentTime={currentTime}
        duration={duration}
        playbackRate={playbackRate}
        onPlayPause={onPlayPause}
        onStop={onStop}
        onSetRate={onSetRate}
        onSeek={onSeek}
      />

      {/* Transcript */}
      <TranscriptPanel
        passage={lesson.passage}
        passageVi={lesson.passageVi ?? ''}
        show={showTranscript}
        showBilingual={showBilingual}
        onToggle={onToggleTranscript}
        onToggleBilingual={onToggleBilingual}
      />

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onStartQuiz}
          className="flex-1 py-3.5 bg-gradient-to-r from-accent-indigo to-accent-cyan text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <span>Bắt đầu làm quiz</span>
          <ChevronRight size={16} />
        </button>
        <button
          onClick={onReset}
          className="px-5 py-3.5 glass-card border border-white/[0.08] text-slate-400 rounded-xl hover:bg-white/[0.07] transition-all"
          title="Chủ đề khác"
        >
          <ArrowLeft size={16} />
        </button>
      </div>
    </div>
  );

// ─── QuizScreen ───────────────────────────────────────────────────────────────

const QuizScreen: React.FC<{
  lesson: NonNullable<ReturnType<typeof useAIListening>['lesson']>;
  isSpeaking: boolean;
  isPaused: boolean;
  playCount: number;
  progress: number;
  currentTime: number;
  duration: number;
  playbackRate: number;
  showTranscript: boolean;
  showBilingual: boolean;
  userAnswers: Record<number, string>;
  quizResults: QuizResult[];
  isSubmitted: boolean;
  totalScore: number;
  answeredCount: number;
  onPlayPause: () => void;
  onStop: () => void;
  onSetRate: (r: number) => void;
  onSeek: (pct: number) => void;
  onToggleTranscript: () => void;
  onToggleBilingual: () => void;
  onAnswer: (id: number, ans: string) => void;
  onSubmit: () => void;
  onRetry: () => void;
  onReset: () => void;
}> = ({
  lesson, isSpeaking, isPaused, playCount, progress, currentTime, duration,
  playbackRate, showTranscript, showBilingual, userAnswers, quizResults, isSubmitted, totalScore,
  answeredCount, onPlayPause, onStop, onSetRate, onSeek, onToggleTranscript, onToggleBilingual,
  onAnswer, onSubmit, onRetry, onReset,
}) => (
    <div className="space-y-4 animate-fadeIn">
      {/* Lesson info compact */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${LEVEL_COLORS[lesson.level]}`}>
            {lesson.level}
          </span>
          <span className="text-sm text-slate-300 font-medium truncate max-w-[200px]">{lesson.title}</span>
        </div>
        <button onClick={onReset} className="p-1.5 glass-card border border-white/[0.07] text-slate-400 rounded-lg hover:text-slate-200 transition-colors">
          <ArrowLeft size={14} />
        </button>
      </div>

      {/* Audio player (compact) */}
      <AudioPlayer
        isSpeaking={isSpeaking}
        isPaused={isPaused}
        playCount={playCount}
        progress={progress}
        currentTime={currentTime}
        duration={duration}
        playbackRate={playbackRate}
        onPlayPause={onPlayPause}
        onStop={onStop}
        onSetRate={onSetRate}
        onSeek={onSeek}
      />

      <TranscriptPanel
        passage={lesson.passage}
        passageVi={lesson.passageVi ?? ''}
        show={showTranscript}
        showBilingual={showBilingual}
        onToggle={onToggleTranscript}
        onToggleBilingual={onToggleBilingual}
      />

      {/* Score card if submitted */}
      {isSubmitted && (
        <ScoreCard
          score={totalScore}
          results={quizResults}
          questions={lesson.questions}
        />
      )}

      {/* Questions */}
      <QuizSection
        questions={lesson.questions}
        userAnswers={userAnswers}
        results={quizResults}
        isSubmitted={isSubmitted}
        onAnswer={onAnswer}
        onSubmit={onSubmit}
        onRetry={onRetry}
        answeredCount={answeredCount}
      />

      {/* After submit CTA */}
      {isSubmitted && (
        <button
          onClick={onReset}
          className="w-full py-3.5 glass-card border border-white/[0.08] text-slate-300 font-bold rounded-xl hover:bg-white/[0.07] transition-all flex items-center justify-center gap-2"
        >
          <Sparkles size={16} className="text-accent-indigo-light" />
          Tạo bài nghe mới
        </button>
      )}
    </div>
  );

// ─── ErrorScreen ──────────────────────────────────────────────────────────────

const ErrorScreen: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="text-center py-12 space-y-4 animate-fadeIn">
    <AlertCircle size={48} className="text-accent-rose mx-auto opacity-70" />
    <h2 className="text-xl font-display font-bold text-slate-100">Không thể tạo bài nghe</h2>
    <div className="p-4 glass-card border border-accent-rose/20 rounded-xl text-left text-sm text-slate-400 max-w-sm mx-auto">
      {message}
    </div>
    <p className="text-xs text-slate-500">Kiểm tra Gemini API Key và thử lại.</p>
    <button
      onClick={onRetry}
      className="px-8 py-3 glass-card border border-white/[0.08] text-slate-300 rounded-xl hover:bg-white/[0.08] transition-all font-medium"
    >
      ← Thử lại
    </button>
  </div>
);

// ─── HistorySection ───────────────────────────────────────────────────────────

const HistorySection: React.FC<{ onReviewLesson: (item: AiListeningHistoryResponse) => void }> = ({ onReviewLesson }) => {
  const [history, setHistory] = useState<AiListeningHistoryResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async (p: number) => {
    setLoading(true);
    try {
      const data = await getListeningHistory(p, 5);
      setHistory(data.content);
      setTotalPages(data.totalPages);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(0);
  }, []);

  if (history.length === 0 && !loading) return null;

  return (
    <div className="glass-card p-5 border border-white/[0.08] space-y-4 animate-fadeIn">
      <h3 className="text-sm font-display font-bold text-slate-100 flex items-center gap-2">
        🕒 Lịch sử luyện nghe
      </h3>
      {loading && history.length === 0 && (
        <div className="text-center text-xs text-slate-500 py-4">Đang tải lịch sử...</div>
      )}
      <div className="space-y-3">
        {history.map((item) => (
          <div key={item.id} className="glass-card border border-white/[0.05] p-3 rounded-xl flex items-center justify-between hover:bg-white/[0.02] transition-all">
            <div className="min-w-0 pr-3">
              <p className="text-sm font-semibold text-slate-200 truncate">{item.topic}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${LEVEL_COLORS[item.level]}`}>{item.level}</span>
                <span className="text-xs text-slate-400">Điểm: {item.score}%</span>
                <span className="text-xs text-slate-500">• {new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            <button
              onClick={() => onReviewLesson(item)}
              className="px-3 py-1.5 flex-shrink-0 glass-card border border-white/[0.08] text-slate-300 text-xs rounded-lg hover:bg-white/[0.07] transition-all flex items-center gap-1.5"
            >
              <Eye size={14} />
              Xem lại
            </button>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            disabled={page === 0 || loading}
            onClick={() => fetchHistory(page - 1)}
            className="px-3 py-1 glass-card border border-white/[0.08] rounded-lg text-slate-300 text-xs disabled:opacity-50 transition-all hover:bg-white/[0.05]"
          >
            Trước
          </button>
          <span className="text-xs text-slate-400">
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1 || loading}
            onClick={() => fetchHistory(page + 1)}
            className="px-3 py-1 glass-card border border-white/[0.08] rounded-lg text-slate-300 text-xs disabled:opacity-50 transition-all hover:bg-white/[0.05]"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

// ─── AIListeningPage (main) ───────────────────────────────────────────────────

export const AIListeningPage: React.FC = () => {
  const {
    status, errorMsg, lesson,
    isSpeaking, isPaused, playCount, speechProgress, speechCurrentTime, speechDuration,
    playbackRate, showTranscript, showBilingual, availableVoices,
    userAnswers, quizResults, totalScore, answeredCount,
    topic, level, questionCount, voiceIndex,
    setTopic, setLevel, setQuestionCount, setVoiceIndex, setPlaybackRate,
    generate, playPause, stopSpeech, seekTo, setAnswer, submitQuiz, retryQuiz, startQuiz, resetAll,
    toggleTranscript, toggleBilingual, previewVoice, loadHistoryReview,
  } = useAIListening();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Top nav */}
      <div className="flex items-center gap-3 mb-6">
        {status !== 'idle' && status !== 'generating' && status !== 'error' && (
          <button
            onClick={resetAll}
            className="p-2 glass-card border border-white/[0.08] text-slate-400 rounded-xl hover:bg-white/[0.08] transition-all"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div>
          <h1 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <Headphones size={20} className="text-accent-indigo-light" />
            Luyện Nghe AI
          </h1>
          {lesson && (status === 'quiz' || status === 'submitted') && (
            <p className="text-xs text-slate-500">{lesson.title}</p>
          )}
        </div>
      </div>

      {/* Screens */}
      {(status === 'idle' || status === 'generating') && (
        <SetupScreen
          topic={topic}
          level={level}
          questionCount={questionCount}
          voiceIndex={voiceIndex}
          availableVoices={availableVoices}
          isLoading={status === 'generating'}
          onSetTopic={setTopic}
          onSetLevel={setLevel}
          onSetQuestionCount={setQuestionCount}
          onSetVoiceIndex={setVoiceIndex}
          onGenerate={generate}
          onPreviewVoice={previewVoice}
        />
      )}

      {status === 'idle' && (
        <div className="mt-8">
          <HistorySection onReviewLesson={loadHistoryReview} />
        </div>
      )}

      {status === 'error' && (
        <ErrorScreen message={errorMsg} onRetry={resetAll} />
      )}

      {status === 'ready' && lesson && (
        <ReadyScreen
          lesson={lesson}
          isSpeaking={isSpeaking}
          isPaused={isPaused}
          playCount={playCount}
          progress={speechProgress}
          currentTime={speechCurrentTime}
          duration={speechDuration}
          playbackRate={playbackRate}
          showTranscript={showTranscript}
          showBilingual={showBilingual}
          onPlayPause={playPause}
          onStop={stopSpeech}
          onSetRate={setPlaybackRate}
          onSeek={seekTo}
          onToggleTranscript={toggleTranscript}
          onToggleBilingual={toggleBilingual}
          onStartQuiz={startQuiz}
          onReset={resetAll}
        />
      )}

      {(status === 'quiz' || status === 'submitted') && lesson && (
        <QuizScreen
          lesson={lesson}
          isSpeaking={isSpeaking}
          isPaused={isPaused}
          playCount={playCount}
          progress={speechProgress}
          currentTime={speechCurrentTime}
          duration={speechDuration}
          playbackRate={playbackRate}
          showTranscript={showTranscript}
          showBilingual={showBilingual}
          userAnswers={userAnswers}
          quizResults={quizResults}
          isSubmitted={status === 'submitted'}
          totalScore={totalScore}
          answeredCount={answeredCount}
          onPlayPause={playPause}
          onStop={stopSpeech}
          onSetRate={setPlaybackRate}
          onSeek={seekTo}
          onToggleTranscript={toggleTranscript}
          onToggleBilingual={toggleBilingual}
          onAnswer={setAnswer}
          onSubmit={submitQuiz}
          onRetry={retryQuiz}
          onReset={resetAll}
        />
      )}
    </div>
  );
};

export default AIListeningPage;