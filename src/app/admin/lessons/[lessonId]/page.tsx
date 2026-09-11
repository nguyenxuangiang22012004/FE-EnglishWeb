'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FileText,
  ArrowLeft,
  ChevronRight,
  Edit2,
  Layers,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { courseService, Lesson, Topic, Course, LessonType } from '@/services/courseService';

const lessonTypeBadge = (type: LessonType) => {
  const map: Record<string, { label: string; className: string }> = {
    VOCABULARY: { label: 'Từ vựng', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    FILL_BLANK: { label: 'Điền từ', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    SHADOWING: { label: 'Shadowing', className: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
    SITUATION: { label: 'Tình huống', className: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' },
    CONVERSATION: { label: 'Hội thoại', className: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  };
  const cfg = map[type] || { label: type, className: 'bg-slate-500/15 text-slate-400 border-slate-500/20' };
  return <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.className}`}>{cfg.label}</span>;
};

const renderPreview = (lesson: Lesson) => {
  try {
    const obj = typeof lesson.contentJson === 'string'
      ? JSON.parse(lesson.contentJson)
      : lesson.contentJson || {};

    switch (lesson.type) {
      case 'VOCABULARY':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">{obj.word || '—'}</span>
              {obj.pronunciation && (
                <span className="text-sm text-slate-400 font-mono">{obj.pronunciation}</span>
              )}
            </div>
            {obj.meaning && (
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase pt-0.5">Nghĩa:</span>
                <span className="text-sm text-emerald-300">{obj.meaning}</span>
              </div>
            )}
            {obj.example && (
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase pt-0.5">Ví dụ:</span>
                <span className="text-sm text-slate-300 italic">"{obj.example}"</span>
              </div>
            )}
          </div>
        );

      case 'FILL_BLANK':
        const sentence = (obj.sentence || '').replace('___', '[ ___ ]');
        return (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase pt-0.5">Câu:</span>
              <span className="text-sm text-white"
                dangerouslySetInnerHTML={{ __html: sentence.replace('[ ___ ]', '<span class="text-amber-400 font-bold bg-amber-500/10 px-1.5 rounded">[ ___ ]</span>') }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Đáp án:</span>
              <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm font-semibold">
                {obj.answer || '—'}
              </span>
            </div>
          </div>
        );

      case 'SHADOWING':
        return (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase">Câu mẫu luyện đọc:</p>
            <p className="text-sm text-white bg-blue-500/5 border border-blue-500/15 rounded-xl px-4 py-3 leading-relaxed">
              {obj.audioText || '—'}
            </p>
          </div>
        );

      case 'SITUATION':
        return (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase">Tình huống:</p>
            <p className="text-sm text-slate-300 bg-indigo-500/5 border border-indigo-500/15 rounded-xl px-4 py-3 leading-relaxed">
              {obj.situation || '—'}
            </p>
          </div>
        );

      case 'CONVERSATION':
        const msgs = Array.isArray(obj.messages) ? obj.messages : [];
        return (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase">{msgs.length} câu thoại:</p>
            <div className="space-y-2">
              {msgs.slice(0, 5).map((m: any, i: number) => (
                <div key={i} className={`flex gap-2 ${m.isAI ? '' : 'flex-row-reverse'}`}>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold flex-shrink-0 ${m.isAI ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                    {m.isAI ? 'AI' : 'User'}
                  </span>
                  <span className={`text-xs text-slate-300 px-3 py-1.5 rounded-xl border ${m.isAI ? 'bg-purple-500/5 border-purple-500/15' : 'bg-blue-500/5 border-blue-500/15'}`}>
                    {m.text}
                  </span>
                </div>
              ))}
              {msgs.length > 5 && (
                <p className="text-xs text-slate-500 text-center">+{msgs.length - 5} câu thoại khác...</p>
              )}
            </div>
          </div>
        );

      default:
        return <p className="text-sm text-slate-400">{String(lesson.contentJson || '—')}</p>;
    }
  } catch {
    return <p className="text-sm text-slate-500 italic">Không thể đọc nội dung</p>;
  }
};

export default function AdminLessonViewPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const lessonData = await courseService.getLessonById(lessonId);
        setLesson(lessonData);

        if (lessonData.topicId) {
          const topicData = await courseService.getTopicById(lessonData.topicId);
          setTopic(topicData);
          if (topicData.courseId) {
            const courseData = await courseService.getCourseDetail(topicData.courseId);
            setCourse(courseData);
          }
        }
      } catch (err) {
        console.error('Failed to load lesson', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lessonId]);

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
        <span className="text-white font-semibold truncate max-w-xs">{lesson?.title || 'Chi tiết'}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText size={24} className="text-emerald-400" />
            {lesson?.title || 'Chi tiết Bài làm'}
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Xem thông tin và nội dung bài làm</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/lessons"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            <ArrowLeft size={16} /> Quay lại
          </Link>
          <Link
            href={`/admin/lessons/${lessonId}/edit`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20 transition-all text-sm"
          >
            <Edit2 size={15} /> Chỉnh sửa
          </Link>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-surface-800/60 border border-white/[0.06] rounded-2xl p-6 backdrop-blur">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-5 pb-4 border-b border-white/[0.06]">
          <FileText size={16} className="text-emerald-400" /> Thông tin Bài làm
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tiêu đề</p>
            <p className="text-sm text-white font-semibold">{lesson?.title || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Loại bài tập</p>
            {lesson && lessonTypeBadge(lesson.type)}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Thứ tự</p>
            <p className="text-sm text-white">{lesson?.orderIndex ?? 0}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Thuộc Chủ đề</p>
            {topic ? (
              <Link
                href={`/admin/topics/${topic.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                <Layers size={13} />
                {topic.name}
              </Link>
            ) : <p className="text-sm text-slate-500">—</p>}
          </div>
          {course && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Thuộc Khóa học</p>
              <Link
                href={`/admin/courses/${course.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                <BookOpen size={13} />
                {course.name}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Content Preview */}
      <div className="bg-surface-800/60 border border-white/[0.06] rounded-2xl p-6 backdrop-blur">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-5 pb-4 border-b border-white/[0.06]">
          Nội dung bài làm
          {lesson && <span className="ml-auto">{lessonTypeBadge(lesson.type)}</span>}
        </h2>
        {lesson && renderPreview(lesson)}
      </div>
    </div>
  );
}
