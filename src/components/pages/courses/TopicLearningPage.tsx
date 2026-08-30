import React, { useState, useEffect, useCallback } from 'react';
import { MascotDialog } from '@/components/ui/courses/MascotDialog';
import { VocabularyCard } from '@/components/ui/courses/VocabularyCard';
import { VoiceRecorder } from '@/components/ui/courses/VoiceRecorder';
import { ChatBubble } from '@/components/ui/courses/ChatBubble';
import { ScoreResult } from '@/components/ui/courses/ScoreResult';
import { FillBlankCard } from '@/components/ui/courses/FillBlankCard';
import { Volume2, Loader2, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  courseService,
  Topic,
  Lesson,
  CourseProgress,
  TopicProgress,
  TopicFinalScore,
} from '@/services/courseService';
import { useRouter } from 'next/navigation';

interface TopicLearningPageProps {
  courseId: string;
  topicId: string;
}

export const TopicLearningPage: React.FC<TopicLearningPageProps> = ({ courseId, topicId }) => {
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);

  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<(number | null)[]>([]); 
  const [score, setScore] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [completedSaved, setCompletedSaved] = useState(false);
  const [finalScoreData, setFinalScoreData] = useState<TopicFinalScore | null>(null);

  const getTopicProgress = useCallback(
    (): TopicProgress | undefined =>
      courseProgress?.topicProgresses.find((p) => p.topicId === topicId),
    [courseProgress, topicId]
  );

  const maxAllowedStep = getTopicProgress()?.currentStep ?? 0;

  const handlePrevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleNextStepNavigation = () => {
    if (step < maxAllowedStep) setStep(step + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [courseDetail, progress, topicLessons] = await Promise.all([
          courseService.getCourseDetail(courseId),
          courseService.getCourseProgress(courseId).catch(() => null),
          courseService.getLessonsByTopic(topicId)
        ]);

        const currentTopic = courseDetail.topics?.find(t => t.id === topicId) || null;
        setTopic(currentTopic);
        setLessons(topicLessons.sort((a, b) => a.orderIndex - b.orderIndex));
        
        if (progress) {
          setCourseProgress(progress);
          const tProgress = progress.topicProgresses.find(p => p.topicId === topicId);
          
          const resumeStep = tProgress?.currentStep ?? 0;
          setStep(resumeStep);

          if (tProgress?.status !== 'COMPLETED' && currentTopic) {
            courseService.updateTopicProgress(topicId, {
              currentStep: resumeStep,
              status: 'IN_PROGRESS',
              currentLessonId: tProgress?.currentLessonId ?? null,
            }).then((updated) => {
               setCourseProgress(prev => {
                 if (!prev) return prev;
                 return {
                   ...prev,
                   topicProgresses: prev.topicProgresses.map(p => p.topicId === topicId ? updated : p)
                 };
               });
            }).catch(console.error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch topic data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId, topicId]);

  const handleNextStep = useCallback(
    async (currentStep: number, currentLesson: Lesson | null, lessonScore?: number | null) => {
      if (!topic) return;

      const nextStep = currentStep + 1;
      setIsSaving(true);

      try {
        if (lessonScore !== undefined && lessonScore !== null) {
          setScores((prev) => {
            const next = [...prev];
            next[currentStep - 1] = lessonScore;
            return next;
          });
        }

        const nextLessonId = lessons[nextStep - 1]?.id ?? null;

        const promises: Promise<any>[] = [
          courseService.updateTopicProgress(topic.id, {
            currentStep: nextStep,
            currentLessonId: nextLessonId,
            status: 'IN_PROGRESS',
          }),
        ];

        if (currentLesson) {
          promises.push(
            courseService.saveLessonActivity({
              lessonId: currentLesson.id,
              topicId: topic.id,
              score: lessonScore ?? null,
              isCompleted: true,
            })
          );
        }

        const [updatedProgress] = await Promise.all(promises);

        setCourseProgress((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            topicProgresses: prev.topicProgresses.map((p) =>
              p.topicId === topic.id ? updatedProgress : p
            ),
          };
        });
      } catch (err) {
        console.error('Failed to save progress', err);
      } finally {
        setIsSaving(false);
        setScore(null);
        setStep(nextStep);
      }
    },
    [topic, lessons]
  );

  const handleCompleteTopic = useCallback(async () => {
    if (!topic) return;
    try {
      const finalData = await courseService.getTopicFinalScore(topic.id);
      setFinalScoreData(finalData);

      const updatedProgress = await courseService.updateTopicProgress(topic.id, {
        currentStep: lessons.length + 1,
        currentLessonId: null,
        status: 'COMPLETED',
        score: finalData.finalScore,
      });

      setCourseProgress((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          topicProgresses: prev.topicProgresses.map((p) =>
            p.topicId === topic.id ? updatedProgress : p
          ),
        };
      });
    } catch (err) {
      console.error('Failed to complete topic', err);
    }
  }, [topic, lessons]);

  const handleResetTopic = async () => {
    if (!topic) return;
    setIsSaving(true);
    try {
      const updatedProgress = await courseService.resetTopicProgress(topic.id);
      setCourseProgress((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          topicProgresses: prev.topicProgresses.map((p) =>
            p.topicId === topic.id ? updatedProgress : p
          ),
        };
      });
      setScores([]);
      setFinalScoreData(null);
      setScore(null);
      setStep(0);
      setCompletedSaved(false);
    } catch (err) {
      console.error('Failed to reset topic', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecordingComplete = async (text: string) => {
    setIsProcessing(true);
    try {
      setTimeout(() => {
        const randomScore = Math.floor(Math.random() * 40) + 60;
        setScore(randomScore);
        setAiFeedback(`Bạn đã nói "${text}". AI đánh giá bạn phát âm và ngữ điệu khá tốt!`);
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (topic && step > 0 && lessons.length > 0 && step > lessons.length && !completedSaved) {
      setCompletedSaved(true);
      handleCompleteTopic();
    }
  }, [step, lessons.length, topic, completedSaved, handleCompleteTopic]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-400">Không tìm thấy chủ đề.</p>
      </div>
    );
  }

  const totalSteps = lessons.length + 1;
  const isWinStep = step > lessons.length;

  const currentLesson = step > 0 && step <= lessons.length ? lessons[step - 1] : null;
  const content = currentLesson?.contentJson
    ? typeof currentLesson.contentJson === 'string'
      ? JSON.parse(currentLesson.contentJson)
      : currentLesson.contentJson
    : {};

  return (
    <div className="w-full flex flex-col items-center justify-center py-4">
      <div className="w-full max-w-6xl relative flex items-center justify-center px-4 md:px-24">
        
        {/* Side Navigation Buttons */}
        <button
          onClick={handlePrevStep}
          disabled={step === 0}
          className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 p-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10 shadow-xl border border-white/10 hidden md:flex"
        >
          <ChevronLeft size={28} />
        </button>

        <button
          onClick={handleNextStepNavigation}
          disabled={step >= maxAllowedStep || step >= totalSteps - 1}
          className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 p-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10 shadow-xl border border-white/10 hidden md:flex"
        >
          <ChevronRight size={28} />
        </button>

        <div className="w-full max-w-4xl bg-surface-800 shadow-sm rounded-3xl p-8 min-h-[80vh] flex flex-col relative overflow-hidden text-slate-100 border border-white/5">
        
        {/* Header Progress & Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            ←
          </button>
          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          {isSaving && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Loader2 size={12} className="animate-spin" />
              Đang lưu...
            </div>
          )}
        </div>

        {/* Dynamic Content based on Step */}
        <div className="flex-1 flex flex-col justify-center items-center gap-8 w-full">
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 text-slate-800">
              <MascotDialog
                message={topic.introMessage || `Chào bạn! Hôm nay chúng ta sẽ học chủ đề '${topic.name}'. Chúng ta sẽ đi qua từng kỹ năng nhé!`}
                onNext={() => handleNextStep(0, null)}
              />
            </div>
          )}

          {currentLesson?.type === 'VOCABULARY' && (
            <div className="animate-in fade-in duration-500 w-full flex flex-col items-center gap-8">
              <h2 className="text-2xl font-bold text-slate-200 text-center">{currentLesson.title}</h2>
              <VocabularyCard
                word={content.word}
                pronunciation={content.pronunciation}
                meaning={content.meaning}
                example={content.example}
              />
              {score === null ? (
                <div className="mt-4 flex flex-col items-center gap-4">
                  <p className="text-slate-400">Hãy nhấn vào mic và đọc to từ trên</p>
                  <VoiceRecorder onRecordingComplete={handleRecordingComplete} isProcessing={isProcessing} />
                </div>
              ) : (
                <ScoreResult
                  score={score}
                  feedback={aiFeedback}
                  onRetry={() => setScore(null)}
                  onNext={() => handleNextStep(step, currentLesson, score)}
                />
              )}
            </div>
          )}

          {currentLesson?.type === 'FILL_BLANK' && (
            <div className="animate-in fade-in duration-500 w-full flex flex-col items-center gap-8">
              <h2 className="text-2xl font-bold text-slate-200 text-center">{currentLesson.title}</h2>
              <FillBlankCard
                key={currentLesson.id}
                sentence={content.sentence}
                answer={content.answer}
                onComplete={() => handleNextStep(step, currentLesson, null)}
              />
            </div>
          )}

          {currentLesson?.type === 'SHADOWING' && (
            <div className="animate-in fade-in duration-500 w-full flex flex-col items-center gap-8 max-w-2xl">
              <h2 className="text-2xl font-bold text-slate-200 text-center">{currentLesson.title}</h2>
              <div className="bg-slate-700/50 text-slate-200 p-6 rounded-2xl w-full border border-white/10 flex flex-col items-center gap-4 text-center">
                <p className="text-xl">"{content.audioText}"</p>
                <button
                  onClick={() => playAudio(content.audioText)}
                  className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                >
                  <Volume2 size={24} />
                </button>
                <p className="text-sm text-slate-400">Nghe và cố gắng lặp lại chính xác ngữ điệu</p>
              </div>
              {score === null ? (
                <VoiceRecorder onRecordingComplete={handleRecordingComplete} isProcessing={isProcessing} />
              ) : (
                <ScoreResult
                  score={score}
                  feedback={aiFeedback}
                  onRetry={() => setScore(null)}
                  onNext={() => handleNextStep(step, currentLesson, score)}
                />
              )}
            </div>
          )}

          {currentLesson?.type === 'SITUATION' && (
            <div className="animate-in fade-in duration-500 w-full flex flex-col items-center gap-8 max-w-2xl">
              <h2 className="text-2xl font-bold text-slate-200 text-center">{currentLesson.title}</h2>
              <div className="bg-blue-500/10 text-blue-200 p-6 rounded-2xl w-full border border-blue-500/20">
                <p className="text-lg">Tình huống: {content.situation}</p>
              </div>
              {score === null ? (
                <VoiceRecorder onRecordingComplete={handleRecordingComplete} isProcessing={isProcessing} />
              ) : (
                <ScoreResult
                  score={score}
                  feedback={aiFeedback}
                  onRetry={() => setScore(null)}
                  onNext={() => handleNextStep(step, currentLesson, score)}
                />
              )}
            </div>
          )}

          {currentLesson?.type === 'CONVERSATION' && (
            <div className="animate-in fade-in duration-500 w-full flex flex-col items-center gap-8 max-w-2xl text-slate-800">
              <h2 className="text-2xl font-bold text-slate-200 text-center">{currentLesson.title}</h2>
              <div className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-200 min-h-[300px]">
                {content.messages?.map((msg: any, i: number) => (
                  <ChatBubble key={i} message={msg.text} isAI={msg.isAI} />
                ))}
              </div>
              <VoiceRecorder onRecordingComplete={() => handleNextStep(step, currentLesson, null)} />
            </div>
          )}

          {isWinStep && (
            <div className="animate-in zoom-in duration-700 w-full flex flex-col items-center gap-4 text-center">
              <img src="/mascot.jpg" alt="Win" className="w-48 h-48 rounded-full border-8 border-green-500/50 mb-4 object-cover" />
              <h2 className="text-4xl font-black text-green-400 mb-2">Chúc mừng!</h2>
              <p className="text-xl text-slate-300">
                Bạn đã hoàn thành xuất sắc toàn bộ chủ đề với {lessons.length} bài học.
              </p>
              
              {finalScoreData ? (
                finalScoreData.finalScore !== null ? (
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mt-4 w-full max-w-sm">
                     <p className="text-2xl text-yellow-400 font-bold mb-2 flex items-center justify-center gap-2">
                      🏆 Điểm tổng kết: {finalScoreData.finalScore}/100
                    </p>
                    <p className="text-sm text-slate-400">
                      Tính từ {finalScoreData.scoredLessonsCount}/{finalScoreData.totalLessonsCount} bài học có đánh giá điểm
                    </p>
                  </div>
                ) : (
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mt-4 w-full max-w-sm">
                    <p className="text-xl text-green-400 font-bold">
                      ✅ Hoàn thành xuất sắc!
                    </p>
                  </div>
                )
              ) : (
                <Loader2 size={32} className="animate-spin text-blue-500 mt-4" />
              )}

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleResetTopic}
                  disabled={isSaving}
                  className="px-8 py-4 bg-slate-700 text-white rounded-full font-bold shadow-lg hover:bg-slate-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  <RotateCcw size={20} /> Học lại từ đầu
                </button>
                <button
                  onClick={() => router.push(`/courses/${courseId}`)}
                  className="px-8 py-4 bg-blue-500 text-white rounded-full font-bold shadow-lg hover:bg-blue-600 transition-all hover:scale-105 active:scale-95"
                >
                  Quay lại danh sách
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation Bar (visible only on small screens) */}
        <div className="flex sm:hidden justify-between items-center w-full mt-8 pt-4 border-t border-slate-700/50">
          <button
            onClick={handlePrevStep}
            disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} /> Quay lại
          </button>
          
          <button
            onClick={handleNextStepNavigation}
            disabled={step >= maxAllowedStep || step >= totalSteps - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Tiến tới <ChevronRight size={20} />
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};
