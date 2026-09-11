'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FileText, ChevronRight, Loader2 } from 'lucide-react';
import { courseService, Lesson } from '@/services/courseService';
import { LessonForm } from '@/components/admin/courses/LessonForm';

export default function AdminLessonEditPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await courseService.getLessonById(lessonId);
        setLesson(data);
      } catch (err) {
        console.error('Failed to load lesson', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lessonId]);

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await courseService.updateLesson(lessonId, data);
      router.push(`/admin/lessons/${lessonId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật bài làm');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/admin/lessons" className="hover:text-white flex items-center gap-1.5 transition-colors">
          <FileText size={16} className="text-emerald-400" />
          Quản lý Bài làm
        </Link>
        <ChevronRight size={14} className="text-slate-600" />
        <Link href={`/admin/lessons/${lessonId}`} className="hover:text-white transition-colors">
          {lesson?.title || 'Chi tiết'}
        </Link>
        <ChevronRight size={14} className="text-slate-600" />
        <span className="text-white font-semibold">Chỉnh sửa</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FileText size={24} className="text-emerald-400" />
          Chỉnh sửa Bài làm
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Cập nhật nội dung bài làm — lưu xong sẽ quay về trang xem chi tiết
        </p>
      </div>

      {/* Lesson Form */}
      <LessonForm
        mode="edit"
        initialData={lesson}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        backHref={`/admin/lessons/${lessonId}`}
      />
    </div>
  );
}
