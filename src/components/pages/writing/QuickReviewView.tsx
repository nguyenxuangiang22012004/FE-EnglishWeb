'use client';

import React, { useState } from 'react';
import {
  Sparkles, CheckCircle, FileText, Send, RotateCcw,
  AlertCircle, BookOpen, Layers, Check, Copy
} from 'lucide-react';
import {
  evaluateEssay,
  saveWritingHistory,
  WritingEvaluationResult
} from '@/services/aiWritingService';
import WritingFeedbackResult from './WritingFeedbackResult';

export const QuickReviewView: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [essayContent, setEssayContent] = useState('');
  const [targetLevel, setTargetLevel] = useState('B1');

  // Evaluating state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<WritingEvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const wordCount = essayContent.trim() ? essayContent.trim().split(/\s+/).length : 0;

  const handleReviewEssay = async () => {
    if (!essayContent.trim()) {
      setError('Vui lòng dán hoặc nhập nội dung bài viết cần chữa!');
      return;
    }

    if (wordCount < 10) {
      setError('Bài viết quá ngắn. Vui lòng nhập ít nhất 10 từ để AI có thể đánh giá.');
      return;
    }

    setError(null);
    setIsEvaluating(true);
    setIsSaved(false);

    try {
      const result = await evaluateEssay(
        topic.trim() || 'General English Writing Review',
        '',
        essayContent.trim(),
        targetLevel
      );
      setEvalResult(result);

      // Auto save to history
      try {
        setIsSaving(true);
        await saveWritingHistory({
          topic: topic.trim() || 'General Writing',
          level: targetLevel,
          writingType: 'ESSAY_REVIEW',
          promptText: topic.trim(),
          essayContent: essayContent.trim(),
          feedbackData: result,
          score: result.overallScore,
          wordCount: result.wordCount || wordCount,
        });
        setIsSaved(true);
      } catch (saveErr) {
        console.warn('Could not auto save to backend:', saveErr);
      } finally {
        setIsSaving(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi chấm bài với AI.';
      setError(msg);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setEvalResult(null);
    setIsSaved(false);
  };

  // Sample essay for quick test
  const handlePasteSample = () => {
    setTopic('The Importance of Reading Books');
    setTargetLevel('B1');
    setEssayContent(
      `Nowadays, many young people does not like reading books because they spend too much time on social media. In my opinion, reading books is very importance for everyone. Firstly, books provide a lot of knowledges about history, science and life skills. It help us understand the world better. Secondly, when you read, you can improve you vocabulary and writing skills. Although watching videos is more entertaining, but reading books train our concentration and imagination. In conclusion, I think everyone should read at least one book every month to broaden their mind.`
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 font-body">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles size={13} />
              AI Chữa Bài Viết Thông Minh
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-xs">Phát hiện lỗi ngữ pháp, chính tả & nâng cấp câu</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Chữa Bài Viết AI
          </h1>
        </div>

        {evalResult && (
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-2 transition-all"
          >
            <RotateCcw size={15} />
            <span>Chữa bài khác</span>
          </button>
        )}
      </div>

      {!evalResult ? (
        <div className="bg-surface-800 border border-white/[0.08] rounded-2xl p-6 md:p-8 space-y-6 shadow-xl animate-fadeIn">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-lg font-bold text-white">Dán bài viết cần kiểm tra</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                AI sẽ phát hiện từng lỗi sai ngữ pháp, chính tả và đề xuất các câu viết tự nhiên hơn.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePasteSample}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-semibold self-start sm:self-auto transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileText size={13} />
              <span>Dán bài mẫu thử nghiệm</span>
            </button>
          </div>

          {/* Topic & Target Level Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Chủ đề hoặc Đề bài (Tùy chọn)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: Advantage and disadvantage of online shopping..."
                className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Trình độ mục tiêu
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['A2', 'B1', 'B2', 'C1'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setTargetLevel(lvl)}
                    className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      targetLevel === lvl
                        ? 'bg-accent-indigo text-white shadow-md shadow-accent-indigo/20 border border-accent-indigo-light'
                        : 'bg-surface-900 text-slate-400 border border-white/5 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Essay Input Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300 uppercase tracking-wider">
                Nội dung bài viết tiếng Anh của bạn
              </label>
              <span className="text-slate-400 font-mono">
                Số từ: <span className="text-white font-bold">{wordCount}</span>
              </span>
            </div>

            <textarea
              value={essayContent}
              onChange={(e) => setEssayContent(e.target.value)}
              placeholder="Dán hoặc gõ đoạn văn / bài luận tiếng Anh của bạn tại đây để AI bắt đầu chữa bài..."
              rows={12}
              className="w-full p-4 rounded-xl bg-surface-900 border border-white/10 text-white placeholder-slate-500 font-sans leading-relaxed text-[15px] focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo transition-all resize-y"
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleReviewEssay}
            disabled={isEvaluating || !essayContent.trim()}
            className="w-full py-4 rounded-xl bg-accent-indigo hover:bg-accent-indigo-light text-white font-bold text-[15px] shadow-lg shadow-accent-indigo/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isEvaluating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI đang phân tích lỗi ngữ pháp, chính tả & câu chữ...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Chữa bài ngay với AI</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <WritingFeedbackResult
          result={evalResult}
          essayContent={essayContent}
          topic={topic || 'Chữa bài viết tự do'}
          onRetry={handleReset}
          isSaving={isSaving}
          isSaved={isSaved}
        />
      )}
    </div>
  );
};

export default QuickReviewView;
