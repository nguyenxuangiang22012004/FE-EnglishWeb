'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  ArrowLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { courseService, Course } from '@/services/courseService';
import { CourseForm } from '@/components/admin/courses/CourseForm';

export default function AdminCourseEditPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
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

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await courseService.updateCourse(courseId, data);
      router.push(`/admin/courses/${courseId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật khóa học');
    } finally {
      setSubmitting(false);
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
    <div className="space-y-8 max-w-3xl">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/admin/courses" className="hover:text-white flex items-center gap-1.5 transition-colors">
          <BookOpen size={16} className="text-red-400" />
          Khóa học
        </Link>
        <ChevronRight size={14} className="text-slate-600" />
        <Link href={`/admin/courses/${courseId}`} className="hover:text-white truncate max-w-xs transition-colors">
          {course?.name || 'Chi tiết'}
        </Link>
        <ChevronRight size={14} className="text-slate-600" />
        <span className="text-white font-semibold">Chỉnh sửa</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BookOpen size={24} className="text-red-400" />
            Chỉnh sửa Khóa học
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Cập nhật thông tin và ảnh bìa khóa học
          </p>
        </div>
        <Link
          href={`/admin/courses/${courseId}`}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm w-fit"
        >
          <ArrowLeft size={16} /> Quay lại chi tiết
        </Link>
      </div>

      {/* Course Form */}
      <CourseForm
        mode="edit"
        initialData={course}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        backHref={`/admin/courses/${courseId}`}
      />
    </div>
  );
}
