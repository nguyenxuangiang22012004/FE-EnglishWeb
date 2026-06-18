'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTypingGame, TypingResult } from '@/components/hooks/useTypingGame';

// ─── Sub-components ────────────────────────────────────────────────────────────

const ProgressBar: React.FC<{ percent: number; current: number; total: number }> = ({
  percent,
  current,
  total,
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-400">
        Từ <span className="font-bold text-slate-200">{current}</span> / {total}
      </span>
      <span className="text-slate-400">{percent}%</span>
    </div>
    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${percent}%`,
          background: 'linear-gradient(90deg, #6366f1, #34d399)',
        }}
      />
    </div>
  </div>
);

const WordCard: React.FC<{
  word: string;
  pronunciation?: string;
  partOfSpeech?: string;
  answerState: string;
  correctMeaning: string;
  showHint: boolean;
}> = ({ word, pronunciation, partOfSpeech, answerState, correctMeaning, showHint }) => (
  <div
    className={`glass-card p-8 text-center border transition-all duration-300 ${
      answerState === 'correct'
        ? 'border-accent-emerald/50 bg-accent-emerald/5'
        : answerState === 'wrong'
        ? 'border-accent-rose/50 bg-accent-rose/5'
        : answerState === 'skipped'
        ? 'border-accent-amber/50 bg-accent-amber/5'
        : 'border-white/[0.08]'
    }`}
  >
    {partOfSpeech && (
      <span className="inline-block px-3 py-1 text-xs font-semibold bg-accent-indigo/15 text-accent-indigo-light rounded-full mb-4 border border-accent-indigo/20">
        {partOfSpeech}
      </span>
    )}
    <h2 className="text-5xl font-display font-bold text-slate-100 mb-3 tracking-wide">
      {word}
    </h2>
    {pronunciation && (
      <p className="text-slate-400 text-lg font-mono">/{pronunciation}/</p>
    )}
    {showHint && answerState === 'unanswered' && (
      <p className="mt-4 text-sm text-accent-amber/80 animate-fadeIn">
        💡 Gợi ý: <span className="font-semibold">{correctMeaning.charAt(0)}...</span>
      </p>
    )}
    {answerState !== 'unanswered' && (
      <div className="mt-5 animate-fadeIn">
        {answerState === 'correct' && (
          <span className="text-accent-emerald font-semibold text-lg">✅ Chính xác!</span>
        )}
        {answerState === 'wrong' && (
          <div className="space-y-1">
            <span className="text-accent-rose font-semibold text-lg block">❌ Sai rồi!</span>
            <span className="text-slate-400 text-sm">
              Đáp án: <span className="text-accent-emerald font-semibold">{correctMeaning}</span>
            </span>
          </div>
        )}
        {answerState === 'skipped' && (
          <div className="space-y-1">
            <span className="text-accent-amber font-semibold text-lg block">⏭️ Đã bỏ qua</span>
            <span className="text-slate-400 text-sm">
              Đáp án: <span className="text-accent-amber font-semibold">{correctMeaning}</span>
            </span>
          </div>
        )}
      </div>
    )}
  </div>
);

const InputArea: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onSkip: () => void;
  onHint: () => void;
  showHint: boolean;
  answerState: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
}> = ({ value, onChange, onKeyDown, onSubmit, onSkip, onHint, showHint, answerState, inputRef }) => (
  <div className="space-y-3">
    <label className="block text-sm font-semibold text-slate-400">
      Gõ nghĩa tiếng Việt
    </label>
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={answerState !== 'unanswered'}
        placeholder="Nhập nghĩa tiếng Việt... (Enter để xác nhận)"
        className={`w-full px-5 py-4 glass-input text-lg font-medium pr-14 transition-all ${
          answerState === 'correct'
            ? 'border-accent-emerald/60 text-accent-emerald'
            : answerState === 'wrong'
            ? 'border-accent-rose/60 text-accent-rose'
            : answerState === 'skipped'
            ? 'border-accent-amber/60 text-accent-amber'
            : ''
        }`}
        autoComplete="off"
        spellCheck={false}
      />
    </div>

    <div className="flex gap-3">
      <button
        onClick={onSubmit}
        disabled={answerState !== 'unanswered' || !value.trim()}
        className="flex-1 py-3 bg-gradient-to-r from-accent-indigo to-accent-emerald text-white font-bold rounded-xl glow-btn disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        ✅ Xác nhận (Enter)
      </button>
      <button
        onClick={onHint}
        disabled={answerState !== 'unanswered' || showHint}
        className="px-4 py-3 bg-accent-amber/10 text-accent-amber border border-accent-amber/20 rounded-xl font-semibold hover:bg-accent-amber/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
      >
        💡 Gợi ý
      </button>
      <button
        onClick={onSkip}
        disabled={answerState !== 'unanswered'}
        className="px-4 py-3 bg-white/[0.05] text-slate-400 border border-white/[0.08] rounded-xl font-semibold hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
      >
        ⏭️ Bỏ qua (Tab)
      </button>
    </div>
  </div>
);

const ResultScreen: React.FC<{
  results: TypingResult[];
  setName: string;
  onRetry: () => void;
  onBack: () => void;
}> = ({ results, setName, onRetry, onBack }) => {
  const correct = results.filter((r) => r.answerState === 'correct').length;
  const wrong = results.filter((r) => r.answerState === 'wrong').length;
  const skipped = results.filter((r) => r.answerState === 'skipped').length;
  const total = results.length;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const totalTime = results.reduce((s, r) => s + r.timeMs, 0);
  const avgTime = total > 0 ? (totalTime / total / 1000).toFixed(1) : '0';

  const scoreColor =
    percent >= 80 ? 'text-accent-emerald' : percent >= 50 ? 'text-accent-amber' : 'text-accent-rose';
  const scoreLabel =
    percent >= 80 ? '🎉 Tuyệt vời!' : percent >= 50 ? '💪 Khá tốt!' : '📚 Cần luyện thêm!';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-5xl mb-2">{scoreLabel.split(' ')[0]}</div>
        <h2 className="text-2xl font-display font-bold text-slate-100">Kết quả luyện gõ</h2>
        <p className="text-slate-400 text-sm">{setName}</p>
      </div>

      {/* Score ring */}
      <div className="glass-card p-6 text-center border border-white/[0.08]">
        <div className={`text-7xl font-display font-bold ${scoreColor} mb-1`}>{percent}%</div>
        <div className={`text-lg font-semibold ${scoreColor}`}>{scoreLabel.slice(2)}</div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="space-y-1">
            <div className="text-2xl font-display font-bold text-accent-emerald">{correct}</div>
            <div className="text-xs text-slate-400">Đúng</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-display font-bold text-accent-rose">{wrong}</div>
            <div className="text-xs text-slate-400">Sai</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-display font-bold text-accent-amber">{skipped}</div>
            <div className="text-xs text-slate-400">Bỏ qua</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/[0.06] text-sm text-slate-400">
          Thời gian trung bình: <span className="font-semibold text-slate-300">{avgTime}s / từ</span>
        </div>
      </div>

      {/* Detail list */}
      {results.length > 0 && (
        <div className="glass-card overflow-hidden border border-white/[0.06]">
          <div className="p-4 border-b border-white/[0.06]">
            <h3 className="font-semibold text-slate-300 text-sm">📋 Chi tiết từng từ</h3>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {results.map((r, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-3 border-b border-white/[0.04] last:border-0"
              >
                <span className="text-lg mt-0.5">
                  {r.answerState === 'correct' ? '✅' : r.answerState === 'wrong' ? '❌' : '⏭️'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-200 text-sm">{r.card.word}</p>
                  <p className="text-xs text-slate-500 truncate">
                    Đáp án đúng:{' '}
                    <span className="text-accent-emerald">{r.card.meaning}</span>
                  </p>
                  {r.answerState === 'wrong' && r.userAnswer && (
                    <p className="text-xs text-accent-rose">
                      Bạn gõ: "{r.userAnswer}"
                    </p>
                  )}
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {(r.timeMs / 1000).toFixed(1)}s
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 py-3.5 bg-gradient-to-r from-accent-indigo to-accent-emerald text-white font-bold rounded-xl glow-btn"
        >
          🔄 Thử lại
        </button>
        <button
          onClick={onBack}
          className="px-6 py-3.5 glass-card border border-white/[0.08] text-slate-300 font-bold rounded-xl hover:bg-white/[0.08] transition-all"
        >
          ← Quay lại
        </button>
      </div>
    </div>
  );
};

const IdleScreen: React.FC<{
  setName: string;
  setEmoji: string;
  totalCards: number;
  onStart: () => void;
  onBack: () => void;
}> = ({ setName, setEmoji, totalCards, onStart, onBack }) => (
  <div className="flex flex-col items-center justify-center py-16 space-y-6 animate-fadeIn">
    <div className="text-6xl animate-float">{setEmoji}</div>
    <div className="text-center space-y-2">
      <h2 className="text-2xl font-display font-bold text-slate-100">{setName}</h2>
      <p className="text-slate-400">
        {totalCards} từ vựng · Gõ nghĩa tiếng Việt · Tab để bỏ qua
      </p>
    </div>

    <div className="glass-card p-5 border border-accent-indigo/20 max-w-sm w-full space-y-3">
      <p className="text-sm font-semibold text-accent-indigo-light">📖 Hướng dẫn</p>
      <ul className="space-y-2 text-sm text-slate-400">
        <li>🔤 Từ tiếng Anh sẽ hiển thị</li>
        <li>✍️ Gõ nghĩa tiếng Việt vào ô bên dưới</li>
        <li>↩️ Nhấn <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Enter</kbd> để xác nhận</li>
        <li>⏭️ Nhấn <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Tab</kbd> để bỏ qua từ</li>
        <li>💡 Dùng nút Gợi ý nếu cần</li>
      </ul>
    </div>

    <div className="flex gap-3 w-full max-w-sm">
      <button
        onClick={onStart}
        className="flex-1 py-4 bg-gradient-to-r from-accent-indigo to-accent-emerald text-white font-bold rounded-xl glow-btn text-lg"
      >
        🚀 Bắt đầu luyện tập
      </button>
      <button
        onClick={onBack}
        className="px-5 py-4 glass-card border border-white/[0.08] text-slate-400 rounded-xl hover:bg-white/[0.07] transition-all"
      >
        ←
      </button>
    </div>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────

export const TypingPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setId = searchParams.get('setId');

  const {
    currentSet,
    isLoading,
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
    setUserInput,
    setShowHint,
    startGame,
    handleSubmit,
    handleSkip,
    handleKeyDown,
    restartGame,
  } = useTypingGame(setId);

  const handleBack = () => router.push('/flashcards');

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <span className="ml-3 text-slate-400">Đang tải từ vựng...</span>
      </div>
    );
  }

  if (!currentSet) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="text-5xl">😕</div>
        <p className="text-slate-400">Không tìm thấy bộ từ. Vui lòng quay lại.</p>
        <button
          onClick={handleBack}
          className="px-6 py-3 glass-card border border-white/[0.08] text-slate-300 rounded-xl hover:bg-white/[0.08] transition-all"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  if (totalCards === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="text-5xl">📭</div>
        <p className="text-slate-400">Bộ từ này chưa có từ vựng nào.</p>
        <button onClick={handleBack} className="px-6 py-3 glass-card border border-white/[0.08] text-slate-300 rounded-xl hover:bg-white/[0.08] transition-all">
          ← Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="p-2 glass-card border border-white/[0.08] text-slate-400 rounded-xl hover:bg-white/[0.08] transition-all"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <span>{currentSet.emoji ?? '✏️'}</span>
            <span>{currentSet.name}</span>
          </h1>
          <p className="text-xs text-slate-500">Chế độ gõ từ</p>
        </div>
      </div>

      {/* Idle */}
      {status === 'idle' && (
        <IdleScreen
          setName={currentSet.name}
          setEmoji={currentSet.emoji ?? '📦'}
          totalCards={totalCards}
          onStart={startGame}
          onBack={handleBack}
        />
      )}

      {/* Playing */}
      {status === 'playing' && currentCard && (
        <div className="space-y-5 animate-fadeIn">
          <ProgressBar
            percent={progressPercent}
            current={currentIndex + 1}
            total={totalCards}
          />

          <div className="flex justify-between text-xs font-semibold">
            <span className="px-2.5 py-1 bg-accent-emerald/10 text-accent-emerald rounded-lg">
              ✅ {results.filter((r) => r.answerState === 'correct').length} đúng
            </span>
            <span className="px-2.5 py-1 bg-accent-rose/10 text-accent-rose rounded-lg">
              ❌ {results.filter((r) => r.answerState === 'wrong').length} sai
            </span>
            <span className="px-2.5 py-1 bg-accent-amber/10 text-accent-amber rounded-lg">
              ⏭️ {results.filter((r) => r.answerState === 'skipped').length} bỏ qua
            </span>
          </div>

          <WordCard
            word={currentCard.word}
            pronunciation={currentCard.pronunciation}
            partOfSpeech={currentCard.partOfSpeech}
            answerState={answerState}
            correctMeaning={currentCard.meaning}
            showHint={showHint}
          />

          <InputArea
            value={userInput}
            onChange={setUserInput}
            onKeyDown={handleKeyDown}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
            onHint={() => setShowHint(true)}
            showHint={showHint}
            answerState={answerState}
            inputRef={inputRef}
          />
        </div>
      )}

      {/* Finished */}
      {status === 'finished' && (
        <ResultScreen
          results={results}
          setName={currentSet.name}
          onRetry={restartGame}
          onBack={handleBack}
        />
      )}
    </div>
  );
};

export default TypingPage;
