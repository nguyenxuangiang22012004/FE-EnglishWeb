'use client';

import React, { useState } from 'react';
import {
  CheckCircle2, AlertTriangle, XCircle, Sparkles, BookOpen,
  ArrowRight, Copy, Check, RotateCcw, Award, TrendingUp,
  FileText, Lightbulb, BookmarkCheck, ChevronDown, ChevronUp,
  Wand2, ShieldCheck, Layers, Star
} from 'lucide-react';
import { WritingEvaluationResult } from '@/services/aiWritingService';

interface WritingFeedbackResultProps {
  result: WritingEvaluationResult;
  essayContent: string;
  topic?: string;
  onRetry?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
}

export const WritingFeedbackResult: React.FC<WritingFeedbackResultProps> = ({
  result,
  essayContent,
  topic,
  onRetry,
  onSave,
  isSaving = false,
  isSaved = false,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'polish' | 'errors' | 'improvements' | 'vocab'>('overview');
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedPolished, setCopiedPolished] = useState(false);

  const totalErrors = (result.spellingErrors?.length || 0) + (result.grammarErrors?.length || 0);

  const handleCopyOriginal = () => {
    navigator.clipboard.writeText(essayContent);
    setCopiedOriginal(true);
    setTimeout(() => setCopiedOriginal(false), 2000);
  };

  const handleCopyPolished = () => {
    if (result.nativePolish?.fullPolishedEssay) {
      navigator.clipboard.writeText(result.nativePolish.fullPolishedEssay);
      setCopiedPolished(true);
      setTimeout(() => setCopiedPolished(false), 2000);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.0) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 6.5) return 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10';
    if (score >= 5.0) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const criteria = result.criteriaScores || {
    grammar: { score: result.overallScore, comment: 'Ngữ pháp ổn định.' },
    vocabulary: { score: result.overallScore, comment: 'Vốn từ vựng tương đối phong phú.' },
    coherence: { score: result.overallScore, comment: 'Bố cục bài viết mạch lạc.' },
    taskResponse: { score: result.overallScore, comment: 'Trả lời đúng trọng tâm đề bài.' },
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner / Summary Card */}
      <div className="bg-surface-800/80 border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-indigo/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles size={13} />
                AI Examiner Đánh giá
              </span>
              {result.cefrLevel && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/10">
                  CEFR: {result.cefrLevel}
                </span>
              )}
              {result.estimatedBand && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  IELTS Band: {result.estimatedBand}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              {topic ? `Chủ đề: ${topic}` : 'Báo cáo chữa bài chi tiết'}
            </h2>
            <p className="text-slate-400 text-sm">
              Độ dài: <span className="text-slate-200 font-semibold">{result.wordCount || essayContent.trim().split(/\s+/).length} từ</span>
              {' • '}
              Tổng số lỗi phát hiện: <span className={totalErrors > 0 ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>{totalErrors} lỗi</span>
            </p>
          </div>

          {/* Score Circle / Badge */}
          <div className="flex items-center gap-3">
            <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 ${getScoreColor(result.overallScore)}`}>
              <span className="text-3xl font-extrabold tracking-tight">{result.overallScore}</span>
              <span className="text-[11px] font-medium opacity-80 uppercase tracking-widest">Thang 10</span>
            </div>

            <div className="flex flex-col gap-2">
              {onSave && (
                <button
                  onClick={onSave}
                  disabled={isSaving || isSaved}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    isSaved
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                      : 'bg-accent-indigo hover:bg-accent-indigo-light text-white shadow-lg shadow-accent-indigo/20'
                  }`}
                >
                  {isSaved ? <BookmarkCheck size={16} /> : <Award size={16} />}
                  <span>{isSaved ? 'Đã lưu bài' : isSaving ? 'Đang lưu...' : 'Lưu kết quả'}</span>
                </button>
              )}
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw size={15} />
                  <span>Luyện lại</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/[0.08] overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <TrendingUp size={16} />
            <span>4 Tiêu chí & Tổng quan</span>
          </button>

          <button
            onClick={() => setActiveTab('polish')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'polish'
                ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Wand2 size={16} className="text-purple-400" />
            <span>Rewrite / Polish (Bản viết lại Native)</span>
          </button>

          <button
            onClick={() => setActiveTab('errors')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'errors'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <AlertTriangle size={16} />
            <span>Lỗi chính tả & Ngữ pháp ({totalErrors})</span>
          </button>

          <button
            onClick={() => setActiveTab('improvements')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'improvements'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Sparkles size={16} />
            <span>Nâng cấp câu ({result.improvedSentences?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('vocab')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'vocab'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <BookOpen size={16} />
            <span>Từ vựng ({result.vocabularySuggestions?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: 4 Criteria & Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Standard Criteria Evaluation Grid */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck size={20} className="text-accent-indigo-light" />
              Đánh giá theo 4 Tiêu chuẩn Chấm điểm Quốc tế
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Criteria 1: Grammar */}
              <div className="bg-surface-800 border border-white/[0.06] rounded-2xl p-5 space-y-2.5 hover:border-indigo-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                    Ngữ pháp & Cấu trúc (Grammar & Accuracy)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg font-bold font-mono text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {criteria.grammar.score} / 10
                  </span>
                </div>
                <div className="w-full bg-surface-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${(criteria.grammar.score / 10) * 100}%` }} />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {criteria.grammar.comment}
                </p>
              </div>

              {/* Criteria 2: Vocabulary */}
              <div className="bg-surface-800 border border-white/[0.06] rounded-2xl p-5 space-y-2.5 hover:border-emerald-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    Vốn từ vựng (Lexical Resource)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg font-bold font-mono text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {criteria.vocabulary.score} / 10
                  </span>
                </div>
                <div className="w-full bg-surface-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${(criteria.vocabulary.score / 10) * 100}%` }} />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {criteria.vocabulary.comment}
                </p>
              </div>

              {/* Criteria 3: Coherence */}
              <div className="bg-surface-800 border border-white/[0.06] rounded-2xl p-5 space-y-2.5 hover:border-amber-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    Mạch lạc & Liên kết câu (Coherence & Cohesion)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg font-bold font-mono text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {criteria.coherence.score} / 10
                  </span>
                </div>
                <div className="w-full bg-surface-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${(criteria.coherence.score / 10) * 100}%` }} />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {criteria.coherence.comment}
                </p>
              </div>

              {/* Criteria 4: Task Response */}
              <div className="bg-surface-800 border border-white/[0.06] rounded-2xl p-5 space-y-2.5 hover:border-purple-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    Độ chuẩn xác nội dung (Task Response)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg font-bold font-mono text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {criteria.taskResponse.score} / 10
                  </span>
                </div>
                <div className="w-full bg-surface-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${(criteria.taskResponse.score / 10) * 100}%` }} />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {criteria.taskResponse.comment}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Feedback */}
          <div className="bg-surface-800 border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <Lightbulb size={18} className="text-amber-400" />
              Nhận xét tổng thể từ Giảng viên AI
            </h3>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line text-[15px]">
              {result.summaryFeedback}
            </p>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
              <h4 className="text-base font-bold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={18} />
                Điểm mạnh nổi bật
              </h4>
              <ul className="space-y-2">
                {result.strengths && result.strengths.length > 0 ? (
                  result.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-400 italic">Chưa ghi nhận điểm mạnh đặc biệt.</li>
                )}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-5 space-y-3">
              <h4 className="text-base font-bold text-rose-300 flex items-center gap-2">
                <XCircle size={18} />
                Điểm cần khắc phục
              </h4>
              <ul className="space-y-2">
                {result.weaknesses && result.weaknesses.length > 0 ? (
                  result.weaknesses.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-400 italic">Bài viết không có lỗi nghiêm trọng.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Original Essay Display Box */}
          <div className="bg-surface-800 border border-white/[0.06] rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-slate-400" />
                Nội dung bài viết của bạn
              </h4>
              <button
                onClick={handleCopyOriginal}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedOriginal ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedOriginal ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            </div>
            <div className="p-4 rounded-xl bg-surface-900/60 border border-white/[0.04] text-slate-300 font-sans leading-relaxed whitespace-pre-wrap text-[15px]">
              {essayContent}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Native Polish & Rewrite */}
      {activeTab === 'polish' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Polish Header */}
          <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
                <Wand2 size={18} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Phiên bản viết lại Native-like (Rewrite & Polish)
                </h3>
                <p className="text-xs text-purple-300">
                  {result.nativePolish?.overallImpression || 'Bài viết đã được trau chuốt lại mượt mà, tự nhiên và chuẩn văn phong học thuật hơn.'}
                </p>
              </div>
            </div>
          </div>

          {/* Full Polished Essay Card */}
          <div className="bg-surface-800 border border-purple-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Star size={13} />
                Bản nâng cấp hoàn chỉnh
              </span>

              <button
                onClick={handleCopyPolished}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedPolished ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedPolished ? 'Đã sao chép' : 'Sao chép bản viết lại'}</span>
              </button>
            </div>

            <div className="p-5 rounded-xl bg-surface-900/90 border border-white/[0.06] text-slate-100 font-sans leading-relaxed whitespace-pre-wrap text-[15.5px]">
              {result.nativePolish?.fullPolishedEssay || 'Chưa có dữ liệu.'}
            </div>
          </div>

          {/* Line-by-line Key Improvements */}
          {result.nativePolish?.keyImprovements && result.nativePolish.keyImprovements.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-purple-400" />
                Phân tích chi tiết các điểm đã nâng cấp:
              </h3>

              <div className="space-y-3">
                {result.nativePolish.keyImprovements.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-surface-800 border border-white/[0.06] rounded-2xl p-5 space-y-3 hover:border-purple-500/40 transition-all shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-purple-400">
                        Nâng cấp #{idx + 1} {item.benefit ? `• ${item.benefit}` : ''}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="p-3.5 rounded-xl bg-surface-900/60 border border-white/[0.04] text-slate-400">
                        <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Cách diễn đạt gốc:
                        </span>
                        &quot;{item.originalPart}&quot;
                      </div>

                      <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-100 font-medium">
                        <span className="block text-[11px] font-bold text-purple-300 uppercase tracking-wider mb-1">
                          ✨ Cách viết mượt mà hơn (Polished):
                        </span>
                        &quot;{item.polishedPart}&quot;
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 bg-surface-900/40 p-3 rounded-lg border border-white/[0.03]">
                      💡 <span className="font-semibold text-slate-200">Tại sao sửa như vậy? </span>
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Errors (Spelling & Grammar) */}
      {activeTab === 'errors' && (
        <div className="space-y-6">
          {totalErrors === 0 ? (
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-3">
              <CheckCircle2 size={42} className="text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Tuyệt vời! Không phát hiện lỗi sai</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Bài viết của bạn không có lỗi chính tả hoặc ngữ pháp cơ bản nào. Hãy xem tab Rewrite / Polish để học thêm cách diễn đạt cao cấp hơn!
              </p>
            </div>
          ) : (
            <>
              {/* Spelling Errors */}
              {result.spellingErrors && result.spellingErrors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Lỗi chính tả ({result.spellingErrors.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.spellingErrors.map((err, idx) => (
                      <div
                        key={idx}
                        className="bg-surface-800 border border-rose-500/20 rounded-xl p-4 space-y-2 hover:border-rose-500/40 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-wrap text-sm">
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono line-through font-semibold">
                            {err.original}
                          </span>
                          <ArrowRight size={14} className="text-slate-500" />
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                            {err.correction}
                          </span>
                        </div>
                        {err.context && (
                          <p className="text-xs text-slate-400 italic">
                            Ngữ cảnh: &quot;{err.context}&quot;
                          </p>
                        )}
                        <p className="text-xs text-slate-300">{err.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grammar Errors */}
              {result.grammarErrors && result.grammarErrors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Lỗi ngữ pháp ({result.grammarErrors.length})
                  </h3>
                  <div className="space-y-3">
                    {result.grammarErrors.map((err, idx) => (
                      <div
                        key={idx}
                        className="bg-surface-800 border border-white/[0.06] rounded-xl p-5 space-y-3 hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {err.errorType || 'Lỗi ngữ pháp'}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">#{idx + 1}</span>
                        </div>

                        <div className="space-y-2">
                          <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 text-sm text-rose-200">
                            <span className="font-semibold text-rose-400 block text-xs uppercase mb-1">Câu gốc chưa chính xác:</span>
                            {err.originalSentence}
                          </div>
                          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-sm text-emerald-200">
                            <span className="font-semibold text-emerald-400 block text-xs uppercase mb-1">Cách sửa đúng:</span>
                            {err.correctedSentence}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed bg-surface-900/50 p-3 rounded-lg border border-white/[0.04]">
                          💡 <span className="font-medium text-slate-200">Giải thích: </span>
                          {err.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab 4: Sentence Improvements */}
      {activeTab === 'improvements' && (
        <div className="space-y-4">
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-4 flex items-center gap-3">
            <Sparkles size={20} className="text-indigo-400 flex-shrink-0" />
            <p className="text-sm text-indigo-200">
              Dưới đây là các câu văn được viết lại nhằm giúp bài viết tự nhiên hơn, sử dụng cấu trúc ngữ pháp đa dạng và tăng band điểm hiệu quả.
            </p>
          </div>

          {result.improvedSentences && result.improvedSentences.length > 0 ? (
            <div className="space-y-4">
              {result.improvedSentences.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-surface-800 border border-white/[0.06] rounded-2xl p-5 space-y-3 hover:border-indigo-500/30 transition-all shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                      <TrendingUp size={13} />
                      {item.bandUpgrade || 'Đề xuất nâng cấp'}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Gợi ý #{idx + 1}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3.5 rounded-xl bg-surface-900/60 border border-white/[0.04] text-slate-400 text-sm">
                      <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Câu gốc ban đầu:
                      </span>
                      &quot;{item.originalSentence}&quot;
                    </div>

                    <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-100 text-sm font-medium">
                      <span className="block text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-1">
                        ✨ Câu viết nâng cấp / tự nhiên hơn:
                      </span>
                      &quot;{item.betterSentence}&quot;
                    </div>
                  </div>

                  {item.reason && (
                    <div className="text-xs text-slate-300 bg-surface-900/40 p-3 rounded-lg border border-white/[0.03]">
                      <span className="font-semibold text-slate-200">Lý do nâng cấp: </span>
                      {item.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-800 border border-white/[0.06] rounded-2xl p-8 text-center text-slate-400">
              Không có đề xuất viết lại câu cụ thể cho bài viết này.
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Vocabulary Suggestions */}
      {activeTab === 'vocab' && (
        <div className="space-y-4">
          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
            <BookOpen size={20} className="text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-200">
              Nâng cấp vốn từ vựng bằng cách thay thế các từ đơn giản, lặp lại bằng các từ vựng học thuật, giàu biểu cảm hơn.
            </p>
          </div>

          {result.vocabularySuggestions && result.vocabularySuggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.vocabularySuggestions.map((v, idx) => (
                <div
                  key={idx}
                  className="bg-surface-800 border border-white/[0.06] rounded-2xl p-5 space-y-3 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-surface-900 text-slate-400 font-mono text-sm border border-white/[0.06] line-through">
                      {v.simpleWord}
                    </span>
                    <ArrowRight size={16} className="text-slate-500" />
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold font-mono text-sm border border-emerald-500/30">
                      {v.advancedAlternative}
                    </span>
                  </div>

                  {v.exampleInContext && (
                    <div className="p-3 rounded-xl bg-surface-900/60 border border-white/[0.04] text-xs text-slate-300">
                      <span className="text-slate-500 font-semibold block mb-0.5">Ví dụ ứng dụng:</span>
                      &quot;{v.exampleInContext}&quot;
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-800 border border-white/[0.06] rounded-2xl p-8 text-center text-slate-400">
              Chưa có gợi ý từ vựng mới cho bài viết này.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WritingFeedbackResult;
