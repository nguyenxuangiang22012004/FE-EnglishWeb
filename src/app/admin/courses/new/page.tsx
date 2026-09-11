'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ArrowLeft, ChevronRight } from 'lucide-react';
import { courseService } from '@/services/courseService';
import { CourseForm } from '@/components/admin/courses/CourseForm';

export default function AdminNewCoursePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const created = await courseService.createCourse(data);
      router.push(`/admin/courses/${created.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi tạo khóa học');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/admin/courses" className="hover:text-white flex items-center gap-1.5 transition-colors">
          <BookOpen size={16} className="text-red-400" />
          Khóa học
        </Link>
        <ChevronRight size={14} className="text-slate-600" />
        <span className="text-white font-semibold">Tạo khóa học mới</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <BookOpen size={24} className="text-red-400" />
          Thêm Khóa học mới
        </h1>
        <Link
          href="/admin/courses"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm"
        >
          <ArrowLeft size={16} /> Quay lại
        </Link>
      </div>

      {/* Course Form */}
      <CourseForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        backHref="/admin/courses"
      />
    </div>
  );
}
