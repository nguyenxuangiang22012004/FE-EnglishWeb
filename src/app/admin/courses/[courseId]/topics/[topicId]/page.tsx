'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Layers,
  FileText,
  ArrowLeft,
  ChevronRight,
  Save,
  Plus,
  Edit2,
  Trash2,
  Loader2,
} from 'lucide-react';
import { courseService, Course, Topic, Lesson, LessonType } from '@/services/courseService';

export default function AdminTopicDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const topicId = params.topicId as string;

  // Course & Topic State
  const [course, setCourse] = useState<Course | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Topic Form state
  const [name, setName] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [mascotImageUrl, setMascotImageUrl] = useState('/mascot.jpg');
  const [introMessage, setIntroMessage] = useState('');
  const [description, setDescription] = useState('');
  const [savingTopic, setSavingTopic] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [courseData, topicData, lessonsData] = await Promise.all([
        courseService.getCourseDetail(courseId),
        courseService.getTopicById(topicId),
        courseService.getLessonsByTopic(topicId),
      ]);

      setCourse(courseData);
      if (topicData) {
        setTopic(topicData);
        setName(topicData.name || '');
        setOrderIndex(topicData.orderIndex || 0);
        setMascotImageUrl(topicData.mascotImageUrl || '/mascot.jpg');
        setIntroMessage(topicData.introMessage || '');
        setDescription(topicData.description || '');
      }
      setLessons(lessonsData || []);
    } catch (err) {
      console.error('Failed to load topic details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId, topicId]);

  const handleUpdateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên chủ đề');
      return;
    }

    setSavingTopic(true);
    setSaveSuccess(false);
    try {
      await courseService.updateTopic(topicId, {
        name: name.trim(),
        orderIndex: Number(orderIndex) || 0,
        mascotImageUrl: mascotImageUrl.trim(),
        introMessage: introMessage.trim(),
        description: description.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật chủ đề');
    } finally {
      setSavingTopic(false);
    }
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!confirm(`Bạn có chắc muốn xóa bài làm "${lesson.title}"?`)) {
      return;
    }
    try {
      await courseService.deleteLesson(lesson.id);
      const updatedLessons = await courseService.getLessonsByTopic(topicId);
      setLessons(updatedLessons || []);
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
        <Link href="/admin/courses" className="hover:text-white flex items-center gap-1.5 transition-colors">
          <BookOpen size={16} className="text-red-400" />
          Khóa học
        </Link>
        <ChevronRight size={14} className="text-slate-600" />
        <Link href={`/admin/courses/${courseId}`} className="hover:text-white flex items-center gap-1.5 transition-colors">
          <Layers size={16} className="text-blue-400" />
          {course?.name || 'Khóa học'}
        </Link>
        <ChevronRight size={14} className="text-slate-600" />
        <span className="text-white font-semibold truncate max-w-xs">{name || 'Chi tiết chủ đề'}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Layers size={24} className="text-blue-400" />
            Chỉnh sửa Chủ đề (Topic)
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Quản lý thông tin chủ đề và danh sách các phần làm bài (lessons)
          </p>
        </div>
        <Link
          href={`/admin/courses/${courseId}`}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm w-fit"
        >
          <ArrowLeft size={16} /> Quay lại Khóa học
        </Link>
      </div>

      {/* ─── Phần 1: Form Chỉnh sửa Chủ đề ──────────────────────────────── */}
      <div className="bg-surface-800/60 border border-white/[0.06] rounded-2xl p-6 sm:p-8 backdrop-blur space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers size={18} className="text-blue-400" />
            Thông tin Chủ đề
          </h2>
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 animate-in fade-in">
              ✓ Đã lưu thay đổi
            </span>
          )}
        </div>

        <form onSubmit={handleUpdateTopic} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">Tên chủ đề *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200">Thứ tự hiển thị (Order Index)</label>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200">Đường dẫn ảnh Mascot</label>
              <input
                type="text"
                value={mascotImageUrl}
                onChange={(e) => setMascotImageUrl(e.target.value)}
                className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">Lời chào Mascot (Intro Message)</label>
            <textarea
              rows={2}
              value={introMessage}
              onChange={(e) => setIntroMessage(e.target.value)}
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">Mô tả chủ đề</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingTopic}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
            >
              <Save size={16} />
              {savingTopic ? 'Đang lưu...' : 'Lưu thông tin chủ đề'}
            </button>
          </div>
        </form>
      </div>

      {/* ─── Phần 2: Danh sách Bài làm (Lessons) của Topic này ────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <FileText size={20} className="text-emerald-400" />
              Danh sách Bài làm trong Chủ đề
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Tổng cộng <span className="text-white font-semibold">{lessons.length}</span> phần bài tập trong chủ đề này
            </p>
          </div>

          <Link
            href={`/admin/courses/${courseId}/topics/${topicId}/lessons/new`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20 transition-all text-sm w-fit"
          >
            <Plus size={16} /> Thêm Bài làm mới
          </Link>
        </div>

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
                {lessons.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 text-sm">
                      Chưa có phần làm bài nào trong chủ đề này. Hãy bấm "Thêm Bài làm mới"!
                    </td>
                  </tr>
                ) : (
                  lessons.map((lesson) => {
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
                            <Link
                              href={`/admin/courses/${courseId}/topics/${topicId}/lessons/${lesson.id}`}
                              className="text-sm font-semibold text-slate-200 hover:text-emerald-400 transition-colors"
                            >
                              {lesson.title}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {renderLessonTypeBadge(lesson.type)}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 max-w-sm truncate">
                          {preview}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/courses/${courseId}/topics/${topicId}/lessons/${lesson.id}`}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
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
        </div>
      </div>
    </div>
  );
}
