'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Layers,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  FileText,
  Edit2,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { courseService, Topic, Course, Lesson, LessonType } from '@/services/courseService';

const lessonTypeBadge = (type: LessonType) => {
  const map: Record<string, { label: string; className: string }> = {
    VOCABULARY: { label: 'Từ vựng', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    FILL_BLANK: { label: 'Điền từ', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    SHADOWING: { label: 'Shadowing', className: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
    SITUATION: { label: 'Tình huống', className: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' },
    CONVERSATION: { label: 'Hội thoại', className: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  };
  const cfg = map[type] || { label: type, className: 'bg-slate-500/15 text-slate-400 border-slate-500/20' };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};

export default function AdminTopicViewPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const topicData = await courseService.getTopicById(topicId);
      setTopic(topicData);

      const [courseData, lessonsData] = await Promise.all([
        courseService.getCourseDetail(topicData.courseId),
        courseService.getLessonsByTopic(topicId),
      ]);
      setCourse(courseData);
      setLessons(lessonsData || []);
    } catch (err) {
      console.error('Failed to load topic', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [topicId]);

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!confirm(`Bạn có chắc muốn xóa bài làm "${lesson.title}"?`)) return;
    try {
      await courseService.deleteLesson(lesson.id);
      const updated = await courseService.getLessonsByTopic(topicId);
      setLessons(updated || []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa bài làm');
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/admin/topics" className="hover:text-white flex items-center gap-1.5 transition-colors">
          <Layers size={16} className="text-blue-400" />
          Quản lý Chủ đề
        </Link>
        <ChevronRight size={14} className="text-slate-600" />
        <span className="text-white font-semibold truncate max-w-xs">{topic?.name || 'Chi tiết'}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Layers size={24} className="text-blue-400" />
            {topic?.name || 'Chi tiết Chủ đề'}
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Xem thông tin và danh sách bài làm trong chủ đề này
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/topics"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            <ArrowLeft size={16} /> Quay lại
          </Link>
          <Link
            href={`/admin/topics/${topicId}/edit`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/20 transition-all text-sm"
          >
            <Edit2 size={15} /> Chỉnh sửa
          </Link>
        </div>
      </div>

      {/* Topic Info Card */}
      <div className="bg-surface-800/60 border border-white/[0.06] rounded-2xl p-6 backdrop-blur">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-5 pb-4 border-b border-white/[0.06]">
          <Layers size={16} className="text-blue-400" /> Thông tin Chủ đề
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tên chủ đề</p>
            <p className="text-sm text-white font-semibold">{topic?.name || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Thuộc Khóa học</p>
            <Link
              href={`/admin/courses/${topic?.courseId}`}
              className="inline-flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
            >
              <BookOpen size={13} />
              {course?.name || '—'}
            </Link>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Thứ tự hiển thị</p>
            <p className="text-sm text-white">{topic?.orderIndex ?? 0}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">URL ảnh Mascot</p>
            <p className="text-sm text-slate-300 font-mono truncate">{topic?.mascotImageUrl || '—'}</p>
          </div>
          {topic?.introMessage && (
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Lời chào Mascot</p>
              <p className="text-sm text-slate-300 italic">"{topic.introMessage}"</p>
            </div>
          )}
          {topic?.description && (
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Mô tả</p>
              <p className="text-sm text-slate-400">{topic.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Lessons Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <FileText size={20} className="text-emerald-400" />
              Danh sách Bài làm
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Tổng cộng <span className="text-white font-semibold">{lessons.length}</span> bài làm trong chủ đề này
            </p>
          </div>
          <Link
            href={`/admin/courses/${topic?.courseId}/topics/${topicId}/lessons/new`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20 transition-all text-sm"
          >
            <Plus size={16} /> Thêm Bài làm
          </Link>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-surface-800/60 backdrop-blur overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Thứ tự</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiêu đề bài làm</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Loại bài tập</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {lessons.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                      Chưa có bài làm nào. Bấm "Thêm Bài làm" để tạo mới!
                    </td>
                  </tr>
                ) : (
                  lessons.map((lesson) => (
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
                          <Link
                            href={`/admin/lessons/${lesson.id}`}
                            className="text-sm font-semibold text-slate-200 hover:text-emerald-400 transition-colors"
                          >
                            {lesson.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {lessonTypeBadge(lesson.type)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/lessons/${lesson.id}/edit`}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all"
                            title="Chỉnh sửa bài làm"
                          >
                            <Edit2 size={15} />
                          </Link>
                          <button
                            onClick={() => handleDeleteLesson(lesson)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Xóa bài làm"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
