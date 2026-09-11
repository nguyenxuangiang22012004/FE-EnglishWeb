'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Layers, ChevronRight, Loader2 } from 'lucide-react';
import { courseService, Topic } from '@/services/courseService';
import { TopicForm } from '@/components/admin/courses/TopicForm';

export default function AdminTopicEditPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await courseService.getTopicById(topicId);
        setTopic(data);
      } catch (err) {
        console.error('Failed to load topic', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [topicId]);

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await courseService.updateTopic(topicId, data);
      router.push(`/admin/topics/${topicId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật chủ đề');
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
    <div className="space-y-8 max-w-3xl">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/admin/topics" className="hover:text-white flex items-center gap-1.5 transition-colors">
          <Layers size={16} className="text-blue-400" />
          Quản lý Chủ đề
        </Link>
        <ChevronRight size={14} className="text-slate-600" />
        <Link href={`/admin/topics/${topicId}`} className="hover:text-white transition-colors">
          {topic?.name || 'Chi tiết'}
        </Link>
        <ChevronRight size={14} className="text-slate-600" />
        <span className="text-white font-semibold">Chỉnh sửa</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Layers size={24} className="text-blue-400" />
          Chỉnh sửa Chủ đề
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Cập nhật thông tin chủ đề — lưu xong sẽ quay về trang xem chi tiết
        </p>
      </div>

      {/* Topic Form */}
      <TopicForm
        mode="edit"
        initialData={topic}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        backHref={`/admin/topics/${topicId}`}
      />
    </div>
  );
}
