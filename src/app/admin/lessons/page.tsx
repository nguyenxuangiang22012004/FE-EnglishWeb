'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  RefreshCw,
  Filter,
  Layers,
  Eye,
  Edit2,
  Trash2,
  Plus,
} from 'lucide-react';
import { courseService, Topic, Lesson, LessonType } from '@/services/courseService';
import { Pagination } from '@/components/shared/Pagination';

const lessonTypeBadge = (type: LessonType) => {
  const map: Record<string, { label: string; className: string }> = {
    VOCABULARY: { label: 'Từ vựng', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    FILL_BLANK: { label: 'Điền từ', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    SHADOWING: { label: 'Shadowing', className: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
    SITUATION: { label: 'Tình huống', className: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' },
    CONVERSATION: { label: 'Hội thoại', className: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  };
  const cfg = map[type] || { label: type, className: 'bg-slate-500/15 text-slate-400 border-slate-500/20' };
  return <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.className}`}>{cfg.label}</span>;
};

function AdminLessonsContent() {
  const searchParams = useSearchParams();
  const initialTopicId = searchParams.get('topicId') || 'ALL';

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE = 10;

  const loadData = async () => {
    setLoading(true);
    try {
      const [topicRes, lessonRes] = await Promise.all([
        courseService.getAllTopics(),
        courseService.getAllLessons(),
      ]);
      setTopics(topicRes || []);
      setLessons(lessonRes || []);
    } catch (err) {
      console.error('Failed to load lessons', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLessons = lessons.filter((l: any) => {
    const matchTopic =
      selectedTopicId === 'ALL' ||
      l.topicId === selectedTopicId ||
      l.topic?.id === selectedTopicId;
    const matchType =
      selectedType === 'ALL' ||
      l.type?.toUpperCase() === selectedType.toUpperCase();
    return matchTopic && matchType;
  });

  const totalPages = Math.ceil(filteredLessons.length / PAGE_SIZE) || 1;
  const paginatedLessons = filteredLessons.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!confirm(`Bạn có chắc muốn xóa bài làm "${lesson.title}"?`)) return;
    try {
      await courseService.deleteLesson(lesson.id);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa bài làm');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText size={24} className="text-emerald-400" />
            Quản lý Bài làm (Lessons)
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Tổng cộng <span className="text-white font-semibold">{filteredLessons.length}</span> bài làm
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Topic filter */}
          <div className="flex items-center gap-2 bg-surface-800 border border-white/10 px-3 py-1.5 rounded-xl">
            <Filter size={14} className="text-slate-400" />
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Chủ đề:</span>
            <select
              value={selectedTopicId}
              onChange={(e) => {
                setSelectedTopicId(e.target.value);
                setPage(0);
              }}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer max-w-[180px] truncate"
            >
              <option value="ALL" className="bg-surface-900 text-white">Tất cả chủ đề</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id} className="bg-surface-900 text-white">
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lesson Type filter */}
          <div className="flex items-center gap-2 bg-surface-800 border border-white/10 px-3 py-1.5 rounded-xl">
            <Filter size={14} className="text-slate-400" />
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Loại bài:</span>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(0);
              }}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer max-w-[180px] truncate"
            >
              <option value="ALL" className="bg-surface-900 text-white">Tất cả loại bài</option>
              <option value="VOCABULARY" className="bg-surface-900 text-white">Từ vựng (VOCABULARY)</option>
              <option value="FILL_BLANK" className="bg-surface-900 text-white">Điền từ (FILL_BLANK)</option>
              <option value="SHADOWING" className="bg-surface-900 text-white">Shadowing (SHADOWING)</option>
              <option value="SITUATION" className="bg-surface-900 text-white">Tình huống (SITUATION)</option>
              <option value="CONVERSATION" className="bg-surface-900 text-white">Hội thoại (CONVERSATION)</option>
            </select>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white transition-all text-sm"
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          <Link
            href={selectedTopicId !== 'ALL' ? `/admin/lessons/new?topicId=${selectedTopicId}` : '/admin/lessons/new'}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/20 text-sm transition-all"
          >
            <Plus size={16} />
            <span>Thêm Bài làm</span>
          </Link>
        </div>
      </div>

      {/* Lessons Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-surface-800/60 backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">STT</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiêu đề bài làm</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Thuộc chủ đề</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Loại bài tập</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-white/[0.05] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredLessons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                    Chưa có bài làm nào được tìm thấy.
                  </td>
                </tr>
              ) : (
                paginatedLessons.map((lesson: any, idx) => {
                  const topicName = topics.find((t) => t.id === (lesson.topicId || lesson.topic?.id))?.name || '—';
                  const topicId = lesson.topicId || lesson.topic?.id || '';
                  return (
                    <tr key={lesson.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className="w-7 h-7 rounded-lg bg-surface-900 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300">
                          {lesson.orderIndex ?? (page * PAGE_SIZE + idx + 1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0">
                            <FileText size={16} className="text-emerald-400" />
                          </div>
                          <Link
                            href={`/admin/lessons/${lesson.id}`}
                            className="text-sm font-semibold text-slate-200 hover:text-emerald-400 transition-colors"
                          >
                            {lesson.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {topicId ? (
                          <Link
                            href={`/admin/topics/${topicId}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium hover:bg-blue-500/20 transition-colors"
                          >
                            <Layers size={12} />
                            {topicName}
                          </Link>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {lessonTypeBadge(lesson.type)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/lessons/${lesson.id}`}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={15} />
                          </Link>
                          <Link
                            href={`/admin/lessons/${lesson.id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Chỉnh sửa bài làm"
                          >
                            <Edit2 size={15} />
                          </Link>
                          <button
                            onClick={() => handleDeleteLesson(lesson)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Xóa bài làm"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={filteredLessons.length}
          pageSize={PAGE_SIZE}
          onPageChange={(p) => setPage(p)}
          itemLabel="bài làm"
        />
      </div>
    </div>
  );
}

export default function AdminLessonsPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 text-sm p-4">Đang tải...</div>}>
      <AdminLessonsContent />
    </Suspense>
  );
}
