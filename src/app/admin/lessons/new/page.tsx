'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, FileText } from 'lucide-react';
import { courseService, Topic, CreateLessonPayload } from '@/services/courseService';
import LessonForm from '@/components/admin/courses/LessonForm';

function NewLessonContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTopicId = searchParams.get('topicId') || '';

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    courseService
      .getAllTopics()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res as any)?.content || [];
        setTopics(list);
      })
      .catch((err) => {
        console.error('Failed to load topics', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCreate = async (payload: CreateLessonPayload, targetTopicId?: string) => {
    const finalTopicId = targetTopicId || initialTopicId;
    if (!finalTopicId) {
      alert('Vui lòng chọn chủ đề cho bài làm!');
      return;
    }

    try {
      setSubmitting(true);
      const created = await courseService.createLesson(finalTopicId, payload);
      alert('Tạo bài làm mới thành công!');
      router.push(`/admin/lessons/${created.id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Lỗi khi tạo bài làm mới');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb / Back */}
      <div className="flex items-center gap-4">
        <Link
          href={initialTopicId ? `/admin/lessons?topicId=${initialTopicId}` : '/admin/lessons'}
          className="p-2 rounded-xl bg-surface-800/80 border border-white/10 text-slate-400 hover:text-white hover:bg-surface-700 transition-all"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="text-emerald-400" />
            Tạo Bài làm mới
          </h1>
          <p className="text-sm text-slate-400">
            Thêm bài tập thực hành (từ vựng, điền từ, shadowing, hội thoại,...) vào một chủ đề
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-surface-800/60 border border-white/[0.06] rounded-2xl p-12 text-center text-slate-400">
          Đang tải dữ liệu chủ đề...
        </div>
      ) : (
        <LessonForm
          mode="create"
          initialTopicId={initialTopicId}
          topicsList={topics}
          onSubmit={handleCreate}
          isSubmitting={submitting}
          backHref={initialTopicId ? `/admin/lessons?topicId=${initialTopicId}` : '/admin/lessons'}
        />
      )}
    </div>
  );
}

export default function NewLessonPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">
          Đang tải trang tạo bài làm...
        </div>
      }
    >
      <NewLessonContent />
    </Suspense>
  );
}
