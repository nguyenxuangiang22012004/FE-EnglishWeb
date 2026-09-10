'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Layers,
  ArrowLeft,
  ChevronRight,
  Save,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  FileText,
  Loader2,
} from 'lucide-react';
import { courseService, Course, Topic } from '@/services/courseService';

export default function AdminCourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  // Course info form state
  const [name, setName] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  // Topics state
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCourse, setSavingCourse] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [courseData, topicsData] = await Promise.all([
        courseService.getCourseDetail(courseId),
        courseService.getTopicsByCourse(courseId),
      ]);

      if (courseData) {
        setName(courseData.name || '');
        setLevel(courseData.level || 'Beginner');
        setImageUrl(courseData.imageUrl || '');
        setDescription(courseData.description || '');
      }
      setTopics(topicsData || []);
    } catch (err) {
      console.error('Failed to load course details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên khóa học');
      return;
    }

    setSavingCourse(true);
    setSaveSuccess(false);
    try {
      await courseService.updateCourse(courseId, {
        name: name.trim(),
        level: level.trim(),
        imageUrl: imageUrl.trim(),
        description: description.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật khóa học');
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteTopic = async (topic: Topic) => {
    if (!confirm(`Bạn có chắc muốn xóa chủ đề "${topic.name}"? Toàn bộ bài làm trong chủ đề này sẽ bị xóa.`)) {
      return;
    }
    try {
      await courseService.deleteTopic(topic.id);
      const updatedTopics = await courseService.getTopicsByCourse(courseId);
      setTopics(updatedTopics || []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa chủ đề');
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-red-500" size={40} />
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
        <span className="text-white font-semibold truncate max-w-xs">{name || 'Chi tiết khóa học'}</span>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BookOpen size={24} className="text-red-400" />
            Chỉnh sửa Khóa học
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Quản lý thông tin khóa học và danh sách chủ đề (topics) trực thuộc
          </p>
        </div>
        <Link
          href="/admin/courses"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm w-fit"
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </Link>
      </div>

      {/* ─── Phần 1: Form thông tin Khóa học ─────────────────────────────── */}
      <div className="bg-surface-800/60 border border-white/[0.06] rounded-2xl p-6 sm:p-8 backdrop-blur space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen size={18} className="text-red-400" />
            Thông tin Khóa học
          </h2>
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 animate-in fade-in">
              ✓ Đã lưu thay đổi
            </span>
          )}
        </div>

        <form onSubmit={handleUpdateCourse} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">Tên khóa học *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200">Cấp độ (Level)</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="Beginner">Beginner (Cơ bản A1-A2)</option>
                <option value="Intermediate">Intermediate (Trung cấp B1-B2)</option>
                <option value="Advanced">Advanced (Nâng cao C1-C2)</option>
                <option value="All Levels">All Levels (Mọi trình độ)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200">Đường dẫn ảnh bìa (Image URL)</label>
              <input
                type="text"
                placeholder="VD: /images/course.png hoặc https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">Mô tả khóa học</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingCourse}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl shadow-lg shadow-red-500/20 disabled:opacity-50 transition-all"
            >
              <Save size={16} />
              {savingCourse ? 'Đang lưu...' : 'Lưu thông tin khóa học'}
            </button>
          </div>
        </form>
      </div>

      {/* ─── Phần 2: Danh sách Chủ đề (Topics) của Khóa học này ────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Layers size={20} className="text-blue-400" />
              Danh sách Chủ đề (Topics)
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Tổng cộng <span className="text-white font-semibold">{topics.length}</span> chủ đề thuộc khóa học này
            </p>
          </div>

          <Link
            href={`/admin/courses/${courseId}/topics/new`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/20 transition-all text-sm w-fit"
          >
            <Plus size={16} /> Thêm Chủ đề mới
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
                    Tên chủ đề
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Lời chào Mascot
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {topics.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 text-sm">
                      Chưa có chủ đề nào trong khóa học này. Hãy bấm "Thêm Chủ đề mới"!
                    </td>
                  </tr>
                ) : (
                  topics.map((topic) => (
                    <tr key={topic.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className="w-7 h-7 rounded-lg bg-surface-900 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300">
                          {topic.orderIndex ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0">
                            <Layers size={16} className="text-blue-400" />
                          </div>
                          <Link
                            href={`/admin/courses/${courseId}/topics/${topic.id}`}
                            className="text-sm font-semibold text-slate-200 hover:text-blue-400 transition-colors"
                          >
                            {topic.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate italic">
                        {topic.introMessage ? `"${topic.introMessage}"` : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">
                        {topic.description || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/courses/${courseId}/topics/${topic.id}`}
                            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
                            title="Chỉnh sửa Topic & Quản lý bài làm"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => handleDeleteTopic(topic)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Xóa chủ đề"
                          >
                            <Trash2 size={16} />
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
