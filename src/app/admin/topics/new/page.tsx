'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Layers, ArrowLeft, ChevronRight } from 'lucide-react';
import { courseService } from '@/services/courseService';
import { TopicForm } from '@/components/admin/courses/TopicForm';

function AdminNewTopicContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get('courseId') || '';

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: any, courseId?: string) => {
    if (!courseId) {
      alert('Vui lòng chọn khóa học');
      return;
    }

    setSubmitting(true);
    try {
      const created = await courseService.createTopic(courseId, data);
      router.push(`/admin/topics/${created.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi tạo chủ đề');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/admin/topics" className="hover:text-white flex items-center gap-1.5 transition-colors">
          <Layers size={16} className="text-blue-400" />
          Chủ đề
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
          href="/admin/topics"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm"
        >
          <ArrowLeft size={16} /> Quay lại
        </Link>
      </div>

      {/* Topic Form */}
      <TopicForm
        mode="create"
        initialCourseId={initialCourseId}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        backHref="/admin/topics"
      />
    </div>
  );
}

export default function AdminNewTopicPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 text-sm p-4">Đang tải...</div>}>
      <AdminNewTopicContent />
    </Suspense>
  );
}
