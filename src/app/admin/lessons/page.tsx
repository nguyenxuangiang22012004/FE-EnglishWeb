'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Filter,
  Layers,
} from 'lucide-react';
import {
  courseService,
  Topic,
  Lesson,
  LessonType,
} from '@/services/courseService';
import { LessonFormModal } from '@/components/admin/courses/LessonFormModal';

function AdminLessonsContent() {
  const searchParams = useSearchParams();
  const initialTopicId = searchParams.get('topicId') || 'ALL';

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

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

  const filteredLessons = selectedTopicId === 'ALL'
    ? lessons
    : lessons.filter((l: any) => l.topicId === selectedTopicId || l.topic?.id === selectedTopicId);

  const handleCreateOrUpdateLesson = async (data: any) => {
    let topicId = editingLesson ? (editingLesson as any).topicId || (editingLesson as any).topic?.id : selectedTopicId;
    if (!topicId || topicId === 'ALL') {
      if (topics.length === 0) {
        alert('Cần tạo chủ đề trước khi thêm bài làm.');
        return;
      }
      topicId = topics[0].id;
    }

    setSubmitting(true);
    try {
      if (editingLesson) {
        await courseService.updateLesson(editingLesson.id, data);
      } else {
        await courseService.createLesson(topicId, data);
      }
      setLessonModalOpen(false);
      setEditingLesson(null);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi lưu bài làm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!confirm(`Bạn có chắc muốn xóa bài làm "${lesson.title}"?`)) {
      return;
    }
    try {
      await courseService.deleteLesson(lesson.id);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa bài làm');
    }
  };

  const renderLessonTypeBadge = (type: LessonType) => {
    switch (type) {
      case 'VOCABULARY':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Từ vựng</span>;
      case 'FILL_BLANK':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">Điền từ</span>;
      case 'SHADOWING':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20">Shadowing</span>;
      case 'SITUATION':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">Tình huống</span>;
      case 'CONVERSATION':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/20">Hội thoại</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/20">{type}</span>;
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
          {/* Topic filter selector */}
          <div className="flex items-center gap-2 bg-surface-800 border border-white/10 px-3 py-1.5 rounded-xl">
            <Filter size={14} className="text-slate-400" />
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Chủ đề:</span>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              <option value="ALL" className="bg-surface-900 text-white">Tất cả chủ đề</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id} className="bg-surface-900 text-white">
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white transition-all text-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => {
              setEditingLesson(null);
              setLessonModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20 transition-all text-sm"
          >
            <Plus size={16} /> Thêm Bài làm
          </button>
        </div>
      </div>

      {/* Lessons Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-surface-800/60 backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">
                  Thứ tự
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tiêu đề bài làm
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Thuộc chủ đề
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Loại bài tập
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Nội dung tóm tắt
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-white/[0.05] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredLessons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                    Chưa có bài làm nào được tìm thấy.
                  </td>
                </tr>
              ) : (
                filteredLessons.map((lesson: any) => {
                  const topicName = lesson.topicName || topics.find((t) => t.id === (lesson.topicId || lesson.topic?.id))?.name || '—';
                  let preview = '—';
                  try {
                    const obj = typeof lesson.contentJson === 'string' ? JSON.parse(lesson.contentJson) : lesson.contentJson;
                    if (lesson.type === 'VOCABULARY') preview = `${obj.word || ''} (${obj.pronunciation || ''}): ${obj.meaning || ''}`;
                    else if (lesson.type === 'FILL_BLANK') preview = `Câu: ${obj.sentence || ''} [Đáp án: ${obj.answer || ''}]`;
                    else if (lesson.type === 'SHADOWING') preview = `Mẫu: ${obj.audioText || ''}`;
                    else if (lesson.type === 'SITUATION') preview = `${obj.situation || ''}`;
                    else if (lesson.type === 'CONVERSATION') preview = `${obj.messages?.length || 0} câu thoại`;
                  } catch {
                    preview = String(lesson.contentJson || '—');
                  }

                  return (
                    <tr key={lesson.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className="w-7 h-7 rounded-lg bg-surface-900 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300">
                          {lesson.orderIndex ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0">
                            <FileText size={16} className="text-emerald-400" />
                          </div>
                          <span className="text-sm font-semibold text-slate-200">{lesson.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-medium flex items-center gap-1.5 w-fit">
                          <Layers size={12} />
                          {topicName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {renderLessonTypeBadge(lesson.type)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate">
                        {preview}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingLesson(lesson);
                              setLessonModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            title="Chỉnh sửa bài làm"
                          >
                            <Edit2 size={15} />
                          </button>
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
      </div>

      {lessonModalOpen && (
        <LessonFormModal
          initialTitle={editingLesson?.title}
          initialType={editingLesson?.type}
          initialOrderIndex={editingLesson?.orderIndex}
          initialContentJson={editingLesson?.contentJson}
          isSubmitting={submitting}
          onSubmit={handleCreateOrUpdateLesson}
          onCancel={() => {
            setLessonModalOpen(false);
            setEditingLesson(null);
          }}
        />
      )}
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
