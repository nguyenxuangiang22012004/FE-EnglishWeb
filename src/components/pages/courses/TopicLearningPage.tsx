import React, { useState, useEffect, useCallback } from 'react';
import { MascotDialog } from '@/components/ui/courses/MascotDialog';
import { VocabularyCard } from '@/components/ui/courses/VocabularyCard';
import { VoiceRecorder } from '@/components/ui/courses/VoiceRecorder';
import { RecordingPlayback } from '@/components/ui/courses/RecordingPlayback';
import { ChatBubble } from '@/components/ui/courses/ChatBubble';
import { FillBlankCard } from '@/components/ui/courses/FillBlankCard';
import { SituationEvaluationCard } from '@/components/ui/courses/SituationEvaluationCard';
import { Volume2, Loader2, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  courseService,
  Topic,
  Lesson,
  CourseProgress,
  TopicProgress,
  TopicFinalScore,
} from '@/services/courseService';
import {
  evaluateSituationResponse,
  SituationEvaluationResult,
} from '@/services/situationEvaluationService';
import { useRouter } from 'next/navigation';

interface Recording {
  url: string;
  index: number;
}

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
  const [isSaving, setIsSaving] = useState(false);
  const [completedSaved, setCompletedSaved] = useState(false);
  const [finalScoreData, setFinalScoreData] = useState<TopicFinalScore | null>(null);

  // Trạng thái ghi âm: lưu theo lessonId để mỗi từ/lesson có danh sách riêng
  const [recordingsMap, setRecordingsMap] = useState<Record<string, Recording[]>>({});
  const [showingPlaybackSet, setShowingPlaybackSet] = useState<Record<string, boolean>>({});

  // Trạng thái đánh giá Tình huống (SITUATION Evaluation)
  const [situationEvalMap, setSituationEvalMap] = useState<Record<string, SituationEvaluationResult>>({});
  const [isEvaluatingSituation, setIsEvaluatingSituation] = useState(false);

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
      try {
        const [topicData, lessonsData, progressData] = await Promise.all([
          courseService.getTopicById(topicId),
          courseService.getLessonsByTopic(topicId),
          courseService.getCourseProgress(courseId).catch(() => null),
        ]);

        setTopic(topicData);
        setLessons(lessonsData);
        setCourseProgress(progressData);

        const currentTopicProgress = progressData?.topicProgresses.find(
          (p) => p.topicId === topicId
        );

        if (currentTopicProgress) {
          const currentStep = currentTopicProgress.currentStep;
          if (currentStep > lessonsData.length) {
            setStep(0);
          } else {
            setStep(currentStep);
          }
        } else {
          setStep(0);
        }
      } catch (err) {
        console.error('Failed to load topic learning data', err);
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
      setRecordingsMap({});
      setShowingPlaybackSet({});
      setSituationEvalMap({});
      setFinalScoreData(null);
      setStep(0);
      setCompletedSaved(false);
    } catch (err) {
      console.error('Failed to reset topic', err);
    } finally {
      setIsSaving(false);
    }
  };

  /** Thêm bản ghi mới vào danh sách của lesson hiện tại */
  const handleRecordingComplete = (audioBlob: Blob, audioUrl: string) => {
    const key = `step-${step}`;
    setRecordingsMap((prev) => {
      const existing = prev[key] ?? [];
      return { ...prev, [key]: [...existing, { url: audioUrl, index: existing.length + 1 }] };
    });
    setShowingPlaybackSet((prev) => ({ ...prev, [key]: true }));
  };

  /** Xử lý khi thu âm tình huống hoàn thành: Gửi request đánh giá đến AI */
  const handleSituationRecordingComplete = async (
    audioBlob: Blob,
    audioUrl: string,
    transcript?: string,
    situationText?: string
  ) => {
    const key = `step-${step}`;
    const userSpeech = transcript || 'Hello';
    const situation = situationText || '';

    setIsEvaluatingSituation(true);
    try {
      const evalResult = await evaluateSituationResponse(situation, userSpeech);
      setSituationEvalMap((prev) => ({ ...prev, [key]: evalResult }));
    } catch (error) {
      console.error('Situation evaluation error:', error);
    } finally {
      setIsEvaluatingSituation(false);
    }
  };

  /** Thử nói lại tình huống */
  const handleRetrySituation = () => {
    const key = `step-${step}`;
    setSituationEvalMap((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  /** Ghi thêm: ẩn playback của lesson hiện tại, giữ nguyên danh sách */
  const handleRetryRecording = () => {
    const key = `step-${step}`;
    setShowingPlaybackSet((prev) => ({ ...prev, [key]: false }));
  };

  /** Tiếp theo: xoá recordings của lesson này rồi chuyển bước */
  const handleNextAfterRecording = (currentStep: number, lesson: Lesson | null) => {
    const key = `step-${currentStep}`;
    setRecordingsMap((prev) => { const next = { ...prev }; delete next[key]; return next; });
    setShowingPlaybackSet((prev) => { const next = { ...prev }; delete next[key]; return next; });
    handleNextStep(currentStep, lesson, null);
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
  }, [step, lessons, topic, completedSaved, handleCompleteTopic]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p>Đang tải bài học...</p>
      </div>
    );
  }

  const currentLesson = step > 0 && step <= lessons.length ? lessons[step - 1] : null;
  const isIntroStep = step === 0;
  const isWinStep = step > lessons.length;

  let content: any = {};
  if (currentLesson?.contentJson) {
    try {
      content = JSON.parse(currentLesson.contentJson);
    } catch {
      content = {};
    }
  }

  const recordings = recordingsMap[`step-${step}`] ?? [];
  const isShowingPlayback = showingPlaybackSet[`step-${step}`] ?? false;
  const currentSituationEval = situationEvalMap[`step-${step}`] ?? null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 relative pb-12">
      {/* Top Bar Navigation */}
      <div className="w-full max-w-4xl mx-auto p-4 flex items-center justify-between border-b border-white/10">
        <button
          onClick={() => router.push(`/courses/${courseId}`)}
          className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
          title="Thoát bài học"
        >
          ✕
        </button>

        <div className="flex-1 max-w-md mx-6">
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300 rounded-full"
              style={{
                width: `${
                  isIntroStep
                    ? 5
                    : isWinStep
                    ? 100
                    : Math.round((step / lessons.length) * 100)
                }%`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Step Navigation Controls */}
          <div className="flex items-center gap-1 mr-2 border border-white/10 rounded-xl p-1 bg-white/5">
            <button
              onClick={handlePrevStep}
              disabled={step === 0}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Bước trước"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold px-2 text-slate-300">
              {step}/{lessons.length}
            </span>
            <button
              onClick={handleNextStepNavigation}
              disabled={step >= maxAllowedStep}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Bước tiếp theo (nếu đã mở khóa)"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={handleResetTopic}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            title="Làm lại từ đầu"
          >
            <RotateCcw size={14} className={isSaving ? 'animate-spin' : ''} />
            <span>Làm lại</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full">
        {isIntroStep && topic && (
          <div className="animate-in fade-in duration-500 w-full flex flex-col items-center gap-6">
            <MascotDialog
              message={topic.introMessage || `Chào mừng bạn đến với chủ đề: ${topic.name}! Chúng ta hãy bắt đầu nhé.`}
              onNext={() => handleNextStep(step, null, null)}
              showNextBtn={true}
            />
          </div>
        )}

        {!isIntroStep && !isWinStep && (
          <div className="w-full flex flex-col items-center gap-8">
            {currentLesson?.type === 'VOCABULARY' && (
              <div className="animate-in fade-in duration-500 w-full flex flex-col items-center gap-8 max-w-lg">
                <h2 className="text-2xl font-bold text-slate-200 text-center">{currentLesson.title}</h2>
                <VocabularyCard
                  word={content.word}
                  pronunciation={content.pronunciation}
                  meaning={content.meaning}
                  example={content.example}
                  onPlayAudio={() => playAudio(content.word)}
                />

                {isShowingPlayback && recordings.length > 0 ? (
                  <RecordingPlayback
                    audioUrl={recordings[recordings.length - 1].url}
                    recordings={recordings}
                    onRetry={handleRetryRecording}
                    onNext={() => handleNextAfterRecording(step, currentLesson)}
                  />
                ) : (
                  <div className="mt-4 flex flex-col items-center gap-4">
                    <p className="text-slate-400">
                      {recordings.length === 0
                        ? 'Hãy nhấn vào mic và đọc to từ trên'
                        : `Đã ghi ${recordings.length} lần — nhấn để ghi thêm`}
                    </p>
                    <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
                  </div>
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
                  <p className="text-xl">&ldquo;{content.audioText}&rdquo;</p>
                  <button
                    onClick={() => playAudio(content.audioText)}
                    className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                  >
                    <Volume2 size={24} />
                  </button>
                  <p className="text-sm text-slate-400">Nghe và cố gắng lặp lại chính xác ngữ điệu</p>
                </div>
                {isShowingPlayback && recordings.length > 0 ? (
                  <RecordingPlayback
                    audioUrl={recordings[recordings.length - 1].url}
                    recordings={recordings}
                    onRetry={handleRetryRecording}
                    onNext={() => handleNextAfterRecording(step, currentLesson)}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    {recordings.length > 0 && (
                      <p className="text-sm text-slate-400">
                        Đã ghi {recordings.length} lần — nhấn để ghi thêm
                      </p>
                    )}
                    <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
                  </div>
                )}
              </div>
            )}

            {currentLesson?.type === 'SITUATION' && (
              <div className="animate-in fade-in duration-500 w-full flex flex-col items-center gap-8 max-w-2xl">
                <h2 className="text-2xl font-bold text-slate-200 text-center">{currentLesson.title}</h2>
                <div className="bg-blue-500/10 text-blue-200 p-6 rounded-2xl w-full border border-blue-500/20 shadow-lg">
                  <p className="text-lg leading-relaxed">
                    <strong className="text-blue-400 font-semibold">Tình huống:</strong> {content.situation}
                  </p>
                </div>

                {isEvaluatingSituation ? (
                  <div className="p-8 rounded-3xl bg-surface-800/80 border border-white/10 flex flex-col items-center justify-center gap-3 w-full animate-fadeIn">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    <p className="text-slate-300 font-medium text-sm">
                      AI đang phân tích câu trả lời của bạn theo tình huống...
                    </p>
                  </div>
                ) : currentSituationEval ? (
                  <SituationEvaluationCard
                    result={currentSituationEval}
                    onRetry={handleRetrySituation}
                    onNext={() => {
                      const finalScore = currentSituationEval.score ?? null;
                      handleNextStep(step, currentLesson, finalScore);
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-slate-400 text-sm">
                      Hãy bấm mic và nói câu trả lời của bạn cho tình huống trên
                    </p>
                    <VoiceRecorder
                      onRecordingComplete={(blob, url, transcript) =>
                        handleSituationRecordingComplete(blob, url, transcript, content.situation)
                      }
                    />
                  </div>
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
                <VoiceRecorder onRecordingComplete={(_blob, _url) => handleNextStep(step, currentLesson, null)} />
              </div>
            )}
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

            <button
              onClick={() => router.push(`/courses/${courseId}`)}
              className="mt-6 px-8 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/30 transition-all text-lg hover:scale-105"
            >
              Về trang khóa học
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicLearningPage;
