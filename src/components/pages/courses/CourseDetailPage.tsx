import React, { useState, useEffect } from 'react';
import { MascotDialog } from '@/components/ui/courses/MascotDialog';
import { VocabularyCard } from '@/components/ui/courses/VocabularyCard';
import { VoiceRecorder } from '@/components/ui/courses/VoiceRecorder';
import { ChatBubble } from '@/components/ui/courses/ChatBubble';
import { ScoreResult } from '@/components/ui/courses/ScoreResult';
import { FillBlankCard } from '@/components/ui/courses/FillBlankCard';
import { Volume2, BookOpen, Lock, Loader2 } from 'lucide-react';
import { courseService, Topic, Course, Lesson } from '@/services/courseService';
import { useRouter } from 'next/navigation';

interface CourseDetailPageProps {
  courseId: string;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ courseId }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const fetchCourseDetail = async () => {
      setLoading(true);
      try {
        const courseDetail = await courseService.getCourseDetail(courseId);
        setCourse(courseDetail);
        if (courseDetail.topics) {
          setTopics(courseDetail.topics.sort((a, b) => a.orderIndex - b.orderIndex));
        }
      } catch (error) {
        console.error("Failed to fetch course detail", error);
      } finally {
        setLoading(false);
      }
    };
    if (courseId) {
      fetchCourseDetail();
    }
  }, [courseId]);

  const handleStartTopic = async (topic: Topic) => {
    setSelectedTopic(topic);
    setStep(0);
    setScore(null);
    try {
      const topicLessons = await courseService.getLessonsByTopic(topic.id);
      setLessons(topicLessons.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch (error) {
      console.error("Failed to fetch lessons", error);
    }
  };

  const handleRecordingComplete = async (text: string) => {
    setIsProcessing(true);
    try {
      setTimeout(() => {
        setScore(Math.floor(Math.random() * 40) + 60);
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

  if (!selectedTopic) {
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
            const isLocked = index > 0; // Fake lock for demo
            return (
              <div 
                key={topic.id}
                onClick={() => !isLocked && handleStartTopic(topic)}
                className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-300 ${
                  isLocked 
                    ? 'bg-surface-800/50 border-white/5 opacity-70 cursor-not-allowed' 
                    : 'bg-surface-800 border-white/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer group'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-4xl bg-white/5 p-3 rounded-2xl">📚</span>
                  {isLocked && <Lock className="text-slate-500" size={20} />}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{topic.name}</h3>
                <p className="text-slate-400 text-sm mb-6 line-clamp-2">{topic.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const totalSteps = lessons.length + 1; // Mascot + lessons
  const isWinStep = step > lessons.length;
  
  const currentLesson = step > 0 && step <= lessons.length ? lessons[step - 1] : null;
  const content = currentLesson?.contentJson ? (typeof currentLesson.contentJson === 'string' ? JSON.parse(currentLesson.contentJson) : currentLesson.contentJson) : {};

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-4xl bg-surface-800 shadow-sm rounded-3xl p-8 min-h-[80vh] flex flex-col relative overflow-hidden text-slate-100 border border-white/5">
        
        {/* Header Progress & Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => setSelectedTopic(null)}
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
        </div>

        {/* Dynamic Content based on Step */}
        <div className="flex-1 flex flex-col justify-center items-center gap-8 w-full">
          
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 text-slate-800">
              <MascotDialog 
                message={selectedTopic.introMessage || `Chào bạn! Hôm nay chúng ta sẽ học chủ đề '${selectedTopic.name}'. Chúng ta sẽ đi qua từng kỹ năng nhé!`}
                onNext={() => setStep(1)}
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
                <ScoreResult score={score} feedback={aiFeedback} onRetry={() => setScore(null)} onNext={() => { setScore(null); setStep(step + 1); }} />
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
                onComplete={() => setStep(step + 1)} 
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
                <ScoreResult score={score} feedback={aiFeedback} onRetry={() => setScore(null)} onNext={() => { setScore(null); setStep(step + 1); }} />
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
                <ScoreResult score={score} feedback={aiFeedback} onRetry={() => setScore(null)} onNext={() => { setScore(null); setStep(step + 1); }} />
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
              <VoiceRecorder onRecordingComplete={() => setStep(step + 1)} />
            </div>
          )}

          {isWinStep && (
            <div className="animate-in zoom-in duration-700 w-full flex flex-col items-center gap-4 text-center">
              <img src="/mascot.jpg" alt="Win" className="w-48 h-48 rounded-full border-8 border-green-500/50 mb-4 object-cover" />
              <h2 className="text-4xl font-black text-green-400 mb-2">Chúc mừng!</h2>
              <p className="text-xl text-slate-300">Bạn đã hoàn thành xuất sắc toàn bộ chủ đề với {lessons.length} kỹ năng.</p>
              <button 
                onClick={() => { setSelectedTopic(null); setStep(0); }}
                className="mt-8 px-8 py-4 bg-blue-500 text-white rounded-full font-bold shadow-lg hover:bg-blue-600 transition-all hover:scale-105 active:scale-95"
              >
                Quay lại danh sách
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
