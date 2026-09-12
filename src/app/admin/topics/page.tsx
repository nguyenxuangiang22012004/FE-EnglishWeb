'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  RefreshCw,
  FileText,
  Filter,
  BookOpen,
  Eye,
  Edit2,
  Trash2,
  Plus,
} from 'lucide-react';
import { courseService, Course, Topic } from '@/services/courseService';
import { Pagination } from '@/components/shared/Pagination';

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE = 10;

  const loadData = async () => {
    setLoading(true);
    try {
      const [courseRes, topicRes] = await Promise.all([
        courseService.getCourses(0, 100),
        courseService.getAllTopics(),
      ]);
      setCourses(courseRes.content || []);
      setTopics(topicRes || []);
    } catch (err) {
      console.error('Failed to load topics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTopics = selectedCourseId === 'ALL'
    ? topics
    : topics.filter((t: any) => t.courseId === selectedCourseId || t.course?.id === selectedCourseId);

  const totalPages = Math.ceil(filteredTopics.length / PAGE_SIZE) || 1;
  const paginatedTopics = filteredTopics.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleDeleteTopic = async (topic: Topic) => {
    if (!confirm(`Bạn có chắc muốn xóa chủ đề "${topic.name}"? Toàn bộ bài làm trong chủ đề này sẽ bị xóa.`)) return;
    try {
      await courseService.deleteTopic(topic.id);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa chủ đề');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Layers size={24} className="text-blue-400" />
            Quản lý Chủ đề (Topics)
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Tổng cộng <span className="text-white font-semibold">{filteredTopics.length}</span> chủ đề
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Course filter */}
          <div className="flex items-center gap-2 bg-surface-800 border border-white/10 px-3 py-1.5 rounded-xl">
            <Filter size={14} className="text-slate-400" />
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Khóa học:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setPage(0);
              }}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-surface-900 text-white">Tất cả khóa học</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id} className="bg-surface-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white transition-all text-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          <Link
            href={`/admin/topics/new${selectedCourseId !== 'ALL' ? `?courseId=${selectedCourseId}` : ''}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/20 transition-all text-sm"
          >
            <Plus size={16} /> Thêm Chủ đề
          </Link>
        </div>
      </div>

      {/* Topics Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-surface-800/60 backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">STT</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên chủ đề</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Thuộc khóa học</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Lời chào Mascot</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-white/[0.05] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredTopics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                    Chưa có chủ đề nào được tìm thấy.
                  </td>
                </tr>
              ) : (
                paginatedTopics.map((topic: any) => {
                  const courseName = courses.find((c) => c.id === (topic.courseId || topic.course?.id))?.name || '—';
                  const courseId = topic.courseId || topic.course?.id || '';
                  return (
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
                            {topic.description && (
                              <p className="text-xs text-slate-500 line-clamp-1 max-w-xs mt-0.5">{topic.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/courses/${courseId}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium hover:bg-red-500/20 transition-colors"
                        >
                          <BookOpen size={12} />
                          {courseName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate italic">
                        {topic.introMessage ? `"${topic.introMessage}"` : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/lessons?topicId=${topic.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-medium transition-all"
                          >
                            <FileText size={12} /> Bài làm
                          </Link>
                          <Link
                            href={`/admin/topics/${topic.id}`}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={15} />
                          </Link>
                          <Link
                            href={`/admin/topics/${topic.id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Chỉnh sửa chủ đề"
                          >
                            <Edit2 size={15} />
                          </Link>
                          <button
                            onClick={() => handleDeleteTopic(topic)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Xóa chủ đề"
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

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={filteredTopics.length}
          pageSize={PAGE_SIZE}
          onPageChange={(p) => setPage(p)}
          itemLabel="chủ đề"
        />
      </div>
    </div>
  );
}
