'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, BookOpen, AlertTriangle, Clock, Award,
  Trash2, Eye, ShieldCheck, Sparkles, ChevronRight, X,
  FileText, RotateCcw, CheckCircle2, BarChart2, ArrowLeft
} from 'lucide-react';
import {
  getWritingAnalytics,
  getWritingHistory,
  deleteWritingHistory,
  AiWritingAnalyticsResponse,
  AiWritingHistoryResponse
} from '@/services/aiWritingService';
import WritingFeedbackResult from './WritingFeedbackResult';

export const WritingHistoryView: React.FC = () => {
  const [analytics, setAnalytics] = useState<AiWritingAnalyticsResponse | null>(null);
  const [historyItems, setHistoryItems] = useState<AiWritingHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedHistory, setSelectedHistory] = useState<AiWritingHistoryResponse | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsData, historyData] = await Promise.all([
        getWritingAnalytics().catch(() => null),
        getWritingHistory(page, 10).catch(() => ({ content: [], totalPages: 1 })),
      ]);

      if (analyticsData) setAnalytics(analyticsData);
      if (historyData?.content) {
        setHistoryItems(historyData.content);
        setTotalPages(historyData.totalPages || 1);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu lịch sử luyện viết:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc muốn xóa bài viết này khỏi lịch sử?')) return;
    try {
      await deleteWritingHistory(id);
      fetchData();
    } catch (err) {
      alert('Không thể xóa bài viết. Vui lòng thử lại.');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.0) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 6.5) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
    if (score >= 5.0) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  // If a history submission is selected, render clean full view
  if (selectedHistory) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-16 font-body animate-fadeIn">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedHistory(null)}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Quay lại danh sách lịch sử</span>
          </button>
        </div>

        {selectedHistory.feedbackData && (
          <WritingFeedbackResult
            result={selectedHistory.feedbackData}
            essayContent={selectedHistory.essayContent}
            topic={selectedHistory.topic}
            isSaved={true}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 font-body animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <BarChart2 size={13} />
              Theo Dõi Tiến Bộ & Lịch Sử
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Phân Tích Tiến Độ Luyện Viết
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Theo dõi điểm số 4 tiêu chuẩn, các lỗi ngữ pháp hay mắc phải nhất và xem lại các bài viết cũ.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-2 self-start sm:self-auto transition-colors cursor-pointer"
        >
          <RotateCcw size={15} />
          <span>Làm mới số liệu</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm">Đang tổng hợp dữ liệu phân tích...</p>
        </div>
      ) : (
        <>
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Total Essays */}
            <div className="bg-surface-800 border border-white/[0.08] rounded-2xl p-5 space-y-2 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng số bài viết</span>
                <span className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <FileText size={18} />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {analytics?.totalEssays || historyItems.length}
              </div>
              <p className="text-xs text-slate-500">Bài luận & bài viết đã hoàn thành</p>
            </div>

            {/* Card 2: Average Score */}
            <div className="bg-surface-800 border border-white/[0.08] rounded-2xl p-5 space-y-2 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Điểm trung bình</span>
                <span className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Award size={18} />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-emerald-400">
                {analytics?.averageScore ? `${analytics.averageScore} / 10` : '—'}
              </div>
              <p className="text-xs text-slate-500">Đánh giá trung bình từ AI Examiner</p>
            </div>

            {/* Card 3: Total Words */}
            <div className="bg-surface-800 border border-white/[0.08] rounded-2xl p-5 space-y-2 shadow-lg relative overflow-hidden sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng số từ đã viết</span>
                <span className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <BookOpen size={18} />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-amber-400">
                {analytics?.totalWords?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-slate-500">Từ vựng đã thực hành trong bài</p>
            </div>
          </div>

          {/* 4 CRITERIA PROGRESS & TOP MISTAKES SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 4 Criteria Averages (5 cols) */}
            <div className="lg:col-span-5 bg-surface-800 border border-white/[0.08] rounded-2xl p-6 space-y-5 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-indigo-400" />
                Điểm trung bình theo 4 Tiêu chuẩn
              </h3>

              <div className="space-y-4">
                {/* Grammar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Ngữ pháp (Grammar)</span>
                    <span className="font-bold text-indigo-300 font-mono">
                      {analytics?.criteriaAverages?.grammar || 0} / 10
                    </span>
                  </div>
                  <div className="w-full bg-surface-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${((analytics?.criteriaAverages?.grammar || 0) / 10) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Vocabulary */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Vốn từ vựng (Vocabulary)</span>
                    <span className="font-bold text-emerald-300 font-mono">
                      {analytics?.criteriaAverages?.vocabulary || 0} / 10
                    </span>
                  </div>
                  <div className="w-full bg-surface-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${((analytics?.criteriaAverages?.vocabulary || 0) / 10) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Coherence */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Mạch lạc & Liên kết (Coherence)</span>
                    <span className="font-bold text-amber-300 font-mono">
                      {analytics?.criteriaAverages?.coherence || 0} / 10
                    </span>
                  </div>
                  <div className="w-full bg-surface-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${((analytics?.criteriaAverages?.coherence || 0) / 10) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Task Response */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Trọng tâm đề bài (Task Response)</span>
                    <span className="font-bold text-purple-300 font-mono">
                      {analytics?.criteriaAverages?.taskResponse || 0} / 10
                    </span>
                  </div>
                  <div className="w-full bg-surface-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${((analytics?.criteriaAverages?.taskResponse || 0) / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* TOP MISTAKES SECTION (7 cols) */}
            <div className="lg:col-span-7 bg-surface-800 border border-white/[0.08] rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-400" />
                  Top Lỗi Ngữ Pháp Hay Mắc Phải Nhất
                </h3>
                <span className="text-xs text-slate-500">Phân tích từ lịch sử bài viết</span>
              </div>

              {analytics?.topMistakes && analytics.topMistakes.length > 0 ? (
                <div className="space-y-3">
                  {analytics.topMistakes.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-surface-900/80 border border-white/[0.06] rounded-xl p-4 space-y-2 hover:border-amber-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 text-sm flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          {m.errorType}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {m.count} lần mắc
                        </span>
                      </div>

                      {m.advice && (
                        <p className="text-xs text-slate-300 leading-relaxed bg-surface-950/60 p-2.5 rounded-lg border border-white/[0.03]">
                          💡 <span className="text-amber-300 font-semibold">Lời khuyên: </span>
                          {m.advice}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm border border-dashed border-white/10 rounded-xl">
                  Chưa có đủ dữ liệu lỗi để thống kê. Hãy hoàn thành thêm bài viết để hệ thống phân tích!
                </div>
              )}
            </div>
          </div>

          {/* ESSAY HISTORY LIST */}
          <div className="bg-surface-800 border border-white/[0.08] rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock size={20} className="text-slate-400" />
              Lịch sử các bài viết đã nộp
            </h3>

            {historyItems.length > 0 ? (
              <div className="space-y-3">
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedHistory(item)}
                    className="p-4 rounded-xl bg-surface-900/80 border border-white/[0.06] hover:border-accent-indigo/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {item.writingType === 'TOPIC_WRITING' ? 'Theo chủ đề' : 'Chữa bài tự do'}
                        </span>
                        {item.level && (
                          <span className="text-xs font-mono text-slate-400">
                            Level {item.level}
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {item.topic}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {item.essayContent}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {item.score !== undefined && item.score !== null && (
                        <div className={`px-3 py-1 rounded-xl font-mono font-bold text-sm border ${getScoreColor(item.score)}`}>
                          {item.score} / 10
                        </div>
                      )}

                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Xóa bài viết"
                      >
                        <Trash2 size={16} />
                      </button>

                      <span className="text-slate-500 group-hover:text-slate-300 group-hover:translate-x-1 transition-all">
                        <ChevronRight size={18} />
                      </span>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-900 border border-white/10 text-slate-300 disabled:opacity-40"
                    >
                      Trang trước
                    </button>
                    <span className="text-xs text-slate-400">
                      Trang {page + 1} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-900 border border-white/10 text-slate-300 disabled:opacity-40"
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-10 text-center text-slate-500 text-sm border border-dashed border-white/10 rounded-xl">
                Bạn chưa có bài viết nào được lưu. Hãy luyện viết một bài để bắt đầu theo dõi tiến độ nhé!
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WritingHistoryView;
