'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Layers, ArrowLeft, ChevronRight, Save, Loader2 } from 'lucide-react';
import { courseService, Course } from '@/services/courseService';

export default function AdminNewTopicPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [mascotImageUrl, setMascotImageUrl] = useState('/mascot.jpg');
  const [introMessage, setIntroMessage] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const data = await courseService.getCourseDetail(courseId);
        setCourse(data);
      } catch (err) {
        console.error('Failed to load course', err);
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên chủ đề');
      return;
    }

    setSubmitting(true);
    try {
      const created = await courseService.createTopic(courseId, {
        name: name.trim(),
        orderIndex: Number(orderIndex) || 0,
        mascotImageUrl: mascotImageUrl.trim(),
        introMessage: introMessage.trim(),
        description: description.trim(),
      });
      router.push(`/admin/courses/${courseId}/topics/${created.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi tạo chủ đề');
      setSubmitting(false);
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
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/admin/courses" className="hover:text-white flex items-center gap-1.5 transition-colors">
          <BookOpen size={16} className="text-red-400" />
          Khóa học
        </Link>
        <ChevronRight size={14} className="text-slate-600" />
        <Link href={`/admin/courses/${courseId}`} className="hover:text-white flex items-center gap-1.5 transition-colors">
          <Layers size={16} className="text-blue-400" />
          {course?.name || 'Chi tiết khóa học'}
        </Link>
        <ChevronRight size={14} className="text-slate-600" />
        <span className="text-white font-semibold">Tạo chủ đề mới</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Layers size={24} className="text-blue-400" />
          Thêm Chủ đề mới
        </h1>
        <Link
          href={`/admin/courses/${courseId}`}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm"
        >
          <ArrowLeft size={16} /> Quay lại
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-surface-800/60 border border-white/[0.06] rounded-2xl p-6 sm:p-8 backdrop-blur space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200">Tên chủ đề *</label>
          <input
            type="text"
            required
            placeholder="VD: Food & Drinks, Daily Routines..."
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
              placeholder="VD: /mascot.jpg hoặc https://..."
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
            placeholder="VD: Chào bạn! Cùng bắt đầu chủ đề học hôm nay thật hứng khởi nhé!"
            value={introMessage}
            onChange={(e) => setIntroMessage(e.target.value)}
            className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200">Mô tả chủ đề</label>
          <textarea
            rows={3}
            placeholder="VD: Các câu đàm thoại và từ vựng thông dụng..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/[0.06]">
          <Link
            href={`/admin/courses/${courseId}`}
            className="px-5 py-2.5 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
          >
            <Save size={16} />
            {submitting ? 'Đang tạo...' : 'Tạo Chủ đề'}
          </button>
        </div>
      </form>
    </div>
  );
}
