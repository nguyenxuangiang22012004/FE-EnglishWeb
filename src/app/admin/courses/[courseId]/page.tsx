'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  ArrowLeft,
  ChevronRight,
  Edit2,
  Layers,
  Loader2,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { courseService, Course, Topic } from '@/services/courseService';

export default function AdminCourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const courseData = await courseService.getCourseDetail(courseId);
      setCourse(courseData);

      const topicsData = await courseService.getTopicsByCourse(courseId);
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
          Quản lý Khóa học
        </Link>
        <ChevronRight size={14} className="text-slate-600" />
        <span className="text-white font-semibold truncate max-w-xs">{course?.name || 'Chi tiết'}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BookOpen size={24} className="text-red-400" />
            {course?.name || 'Chi tiết Khóa học'}
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Xem thông tin tổng quan và danh sách chủ đề của khóa học
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/courses"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            <ArrowLeft size={16} /> Quay lại
          </Link>
          <Link
            href={`/admin/courses/${courseId}/edit`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg shadow-red-500/20 transition-all text-sm"
          >
            <Edit2 size={15} /> Chỉnh sửa
          </Link>
        </div>
      </div>

      {/* Course Info Card */}
      <div className="bg-surface-800/60 border border-white/[0.06] rounded-2xl p-6 sm:p-8 backdrop-blur">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Thumbnail Preview */}
          <div className="w-full md:w-64 h-44 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 relative">
            {course?.imageUrl ? (
              <img
                src={course.imageUrl}
                alt={course.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/600x400/1e293b/white?text=No+Image';
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                <BookOpen size={36} />
                <span className="text-xs">Chưa có ảnh bìa</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                Cấp độ: {course?.level || 'Beginner'}
              </span>
              <span className="px-3 py-1 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20 text-xs font-semibold flex items-center gap-1.5">
                <Layers size={13} /> {topics.length} Chủ đề
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mô tả khóa học</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {course?.description || 'Chưa có mô tả cho khóa học này.'}
              </p>
            </div>

            {course?.imageUrl && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">URL Ảnh bìa</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-400 font-mono truncate max-w-md bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                    {course.imageUrl}
                  </p>
                  <a
                    href={course.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-red-400 hover:underline flex items-center gap-1 shrink-0"
                  >
                    <ExternalLink size={12} /> Mở ảnh
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Topics Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Layers size={20} className="text-blue-400" />
              Danh sách Chủ đề (Topics)
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Các chủ đề thuộc khóa học này
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/topics?courseId=${courseId}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
            >
              <Layers size={14} /> Quản lý Chủ đề →
            </Link>
          </div>
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
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                      Chưa có chủ đề nào trong khóa học này.{' '}
                      <Link href={`/admin/topics?courseId=${courseId}`} className="text-blue-400 hover:underline">
                        Đi tới trang Quản lý Chủ đề để thêm mới!
                      </Link>
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
                          <div>
                            <Link
                              href={`/admin/topics/${topic.id}`}
                              className="text-sm font-semibold text-slate-200 hover:text-blue-400 transition-colors"
                            >
                              {topic.name}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">
                        {topic.description || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/topics/${topic.id}`}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all"
                            title="Xem chi tiết chủ đề"
                          >
                            <ChevronRight size={16} />
                          </Link>
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
