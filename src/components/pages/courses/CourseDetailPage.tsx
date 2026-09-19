import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Lock, Unlock, Loader2, CheckCircle2, PlayCircle, Sparkles, X, ArrowRight } from 'lucide-react';
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
  const [confirmTopic, setConfirmTopic] = useState<{ topic: Topic; prevTopicName?: string } | null>(null);

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
    const courseIdentifier = course?.slug || courseId;
    const topicIdentifier = topic.slug || topic.id;
    router.push(`/courses/${courseIdentifier}/topic/${topicIdentifier}`);
  };

  const handleTopicClick = (topic: Topic, index: number) => {
    const locked = isTopicLocked(index);
    if (locked) {
      const prevTopicName = index > 0 ? topics[index - 1]?.name : undefined;
      setConfirmTopic({ topic, prevTopicName });
    } else {
      handleStartTopic(topic);
    }
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
              onClick={() => handleTopicClick(topic, index)}
              className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-300 cursor-pointer group ${
                isCompleted
                  ? 'bg-green-500/10 border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 hover:border-green-500/50'
                  : locked
                  ? 'bg-surface-800/80 border-white/10 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 hover:bg-surface-800'
                  : 'bg-surface-800 border-white/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-4xl bg-white/5 p-3 rounded-2xl">📚</span>
                <div className="flex flex-col items-end gap-2">
                  {locked ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full group-hover:bg-amber-500/20 transition-colors">
                      <Lock size={12} /> Chưa mở khóa
                    </span>
                  ) : isCompleted ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                      <CheckCircle2 size={12} /> Hoàn thành
                    </span>
                  ) : isInProgress ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
                      <PlayCircle size={12} /> Đang học
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
                      Sẵn sàng học
                    </span>
                  )}
                </div>
              </div>
              <h3
                className={`text-xl font-bold text-white mb-2 transition-colors ${
                  isCompleted
                    ? 'group-hover:text-green-400'
                    : 'group-hover:text-blue-400'
                }`}
              >
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

              {/* Nhắc nhở click mở bài */}
              {locked && (
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 group-hover:text-blue-400 transition-colors">
                  <span>Nhấn để mở bài học này</span>
                  <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Modal Xác Nhận Mở Bài Học ─────────────────────────────────────────── */}
      {confirmTopic && (
        <div
          onClick={() => setConfirmTopic(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-surface-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative animate-slide-up cursor-default"
          >
            <button
              onClick={() => setConfirmTopic(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/30">
                <Unlock size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Mở khóa bài học?</h3>
                <p className="text-xs text-slate-400">Xác nhận trước khi vào bài</p>
              </div>
            </div>

            <div className="bg-surface-800/80 border border-white/5 rounded-2xl p-4 mb-4">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
                Chủ đề muốn học
              </div>
              <div className="text-base font-bold text-white mb-1">
                {confirmTopic.topic.name}
              </div>
              {confirmTopic.topic.description && (
                <p className="text-xs text-slate-400 line-clamp-2">
                  {confirmTopic.topic.description}
                </p>
              )}
            </div>

            <div className="text-sm text-slate-300 space-y-2 mb-6">
              {confirmTopic.prevTopicName && (
                <p>
                  Theo lộ trình đề xuất, bạn nên hoàn thành bài{' '}
                  <span className="text-blue-400 font-semibold">
                    &quot;{confirmTopic.prevTopicName}&quot;
                  </span>{' '}
                  trước.
                </p>
              )}
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2.5 text-xs text-blue-200">
                <Sparkles size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <span>
                  Bạn hoàn toàn có thể mở học bài này trước. Tiến trình và điểm số vẫn sẽ được lưu độc lập!
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmTopic(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-surface-800 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-sm border border-white/10 transition-colors"
              >
                Để sau
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetTopic = confirmTopic.topic;
                  setConfirmTopic(null);
                  handleStartTopic(targetTopic);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Vào học ngay</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
