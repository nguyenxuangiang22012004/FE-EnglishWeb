import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Lock, Loader2, CheckCircle2, PlayCircle } from 'lucide-react';
import {
  courseService,
  Topic,
  Course,
  CourseProgress,
  TopicProgress,
} from '@/services/courseService';
import { useRouter } from 'next/navigation';

interface CourseDetailPageProps {
  courseId: string;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ courseId }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);

  const router = useRouter();

  // ─── Fetch course + progress khi load ────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [courseDetail, progress] = await Promise.all([
          courseService.getCourseDetail(courseId),
          courseService.getCourseProgress(courseId).catch(() => null),
        ]);

        setCourse(courseDetail);
        if (courseDetail.topics) {
          setTopics(courseDetail.topics.sort((a, b) => a.orderIndex - b.orderIndex));
        }
        if (progress) {
          setCourseProgress(progress);
        }
      } catch (error) {
        console.error('Failed to fetch course data', error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchData();
  }, [courseId]);

  // ─── Helpers: lấy progress của 1 topic ───────────────────────────────────────
  const getTopicProgress = useCallback(
    (topicId: string): TopicProgress | undefined =>
      courseProgress?.topicProgresses.find((p) => p.topicId === topicId),
    [courseProgress]
  );

  const isTopicLocked = useCallback(
    (index: number): boolean => {
      if (index === 0) return false;
      const prevTopic = topics[index - 1];
      if (!prevTopic) return true;
      const prevProgress = getTopicProgress(prevTopic.id);
      
      // Nếu bài trước đó đã từng hoàn thành (isPassed = true), thì mở khóa bài này
      return !prevProgress?.isPassed;
    },
    [topics, getTopicProgress]
  );

  const handleStartTopic = (topic: Topic) => {
    router.push(`/courses/${courseId}/topic/${topic.id}`);
  };

  // ─── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-400">Không tìm thấy khóa học.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 max-w-5xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => router.push('/courses')}
          className="p-3 bg-surface-800 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white border border-white/10 flex-shrink-0"
        >
          ←
        </button>
        <div className="p-4 bg-blue-500/20 rounded-2xl">
          <BookOpen size={32} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{course.name}</h1>
          <p className="text-slate-400">{course.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics.map((topic, index) => {
          const locked = isTopicLocked(index);
          const progress = getTopicProgress(topic.id);
          const isCompleted = progress?.status === 'COMPLETED';
          const isInProgress = progress?.status === 'IN_PROGRESS';

          return (
            <div
              key={topic.id}
              id={`topic-card-${topic.id}`}
              onClick={() => !locked && handleStartTopic(topic)}
              className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-300 ${
                locked
                  ? 'bg-surface-800/50 border-white/5 opacity-60 cursor-not-allowed'
                  : isCompleted
                  ? 'bg-green-500/10 border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 cursor-pointer group'
                  : 'bg-surface-800 border-white/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer group'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-4xl bg-white/5 p-3 rounded-2xl">📚</span>
                <div className="flex flex-col items-end gap-2">
                  {locked && <Lock className="text-slate-500" size={20} />}
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                      <CheckCircle2 size={12} /> Hoàn thành
                    </span>
                  )}
                  {isInProgress && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
                      <PlayCircle size={12} /> Đang học
                    </span>
                  )}
                </div>
              </div>
              <h3 className={`text-xl font-bold text-white mb-2 transition-colors ${!locked && 'group-hover:text-blue-400'} ${isCompleted && 'group-hover:text-green-400'}`}>
                {topic.name}
              </h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{topic.description}</p>

              {/* Progress bar nếu đang học dở */}
              {isInProgress && progress && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Bước {progress.currentStep}/{progress.completedLessonIds.length + 1}</span>
                    <span>{progress.completedLessonIds.length} lesson xong</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${(progress.completedLessonIds.length / Math.max(1, progress.completedLessonIds.length + 1)) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Điểm nếu đã hoàn thành */}
              {isCompleted && progress?.score != null && (
                <div className="mt-2 text-sm font-semibold text-green-400">
                  🏆 Điểm: {progress.score}/100
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
