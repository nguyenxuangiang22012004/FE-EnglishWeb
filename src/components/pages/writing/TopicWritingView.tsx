'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, PenTool, BookOpen, Clock, Target, Lightbulb,
  ArrowLeft, Send, CheckCircle2, ChevronDown, ChevronUp,
  RotateCcw, AlertCircle, History, Layers, Copy, Check,
  LayoutGrid, AlignLeft, Eye, MessageSquare
} from 'lucide-react';
import {
  generateWritingPrompt,
  evaluateEssay,
  saveWritingHistory,
  WritingPromptData,
  WritingEvaluationResult,
  POPULAR_WRITING_TOPICS
} from '@/services/aiWritingService';
import WritingFeedbackResult from './WritingFeedbackResult';

export const TopicWritingView: React.FC = () => {
  // Step state: 'setup' | 'writing' | 'result'
  const [step, setStep] = useState<'setup' | 'writing' | 'result'>('setup');

  // Setup inputs
  const [customTopic, setCustomTopic] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('B1');
  const [targetWords, setTargetWords] = useState(150);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);

  // Generated prompt data
  const [promptData, setPromptData] = useState<WritingPromptData | null>(null);

  // Accordion display states (Mặc định ĐÓNG để người dùng tự mở)
  const [showGuidingQuestions, setShowGuidingQuestions] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [showVocab, setShowVocab] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);

  // Writing Mode: 'block' (Khung sườn 4 blocks) vs 'full' (Trang giấy liền mạch)
  const [writingMode, setWritingMode] = useState<'block' | 'full'>('block');

  // Block states
  const [block1, setBlock1] = useState(''); // Topic sentence / Intro
  const [block2, setBlock2] = useState(''); // Supporting Idea 1 + Example
  const [block3, setBlock3] = useState(''); // Supporting Idea 2 + Example
  const [block4, setBlock4] = useState(''); // Conclusion
  const [fullEssay, setFullEssay] = useState('');

  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);

  // Evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<WritingEvaluationResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Cuộn lên đầu trang khi chuyển sang bước viết
  useEffect(() => {
    if (step === 'writing' && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Helper count words of a string
  const countWords = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  // Assemble full essay from blocks
  const assembledEssay = [block1.trim(), block2.trim(), block3.trim(), block4.trim()]
    .filter(Boolean)
    .join('\n\n');

  // Active essay currently being edited
  const currentEssay = writingMode === 'block' ? assembledEssay : fullEssay;
  const totalWordCount = countWords(currentEssay);

  // Switch modes smoothly
  const handleSwitchMode = (mode: 'block' | 'full') => {
    if (mode === 'full') {
      // Sync from blocks into full essay
      if (assembledEssay.trim() && !fullEssay.trim()) {
        setFullEssay(assembledEssay);
      }
    } else {
      // Sync from full essay back into blocks if blocks were empty
      if (fullEssay.trim() && !assembledEssay.trim()) {
        const paragraphs = fullEssay.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
        if (paragraphs[0]) setBlock1(paragraphs[0]);
        if (paragraphs[1]) setBlock2(paragraphs[1]);
        if (paragraphs[2]) setBlock3(paragraphs[2]);
        if (paragraphs[3]) setBlock4(paragraphs[3]);
      }
    }
    setWritingMode(mode);
  };

  // Handle Generate Prompt
  const handleGeneratePrompt = async (topicToUse?: string, levelToUse?: string, wordsToUse?: number) => {
    const topic = topicToUse || customTopic.trim();
    if (!topic) {
      setPromptError('Vui lòng nhập chủ đề bạn muốn luyện viết!');
      return;
    }

    setPromptError(null);
    setIsGeneratingPrompt(true);

    try {
      const data = await generateWritingPrompt(
        topic,
        levelToUse || selectedLevel,
        'essay',
        wordsToUse || targetWords
      );
      setPromptData(data);

      // Reset content
      setBlock1('');
      setBlock2('');
      setBlock3('');
      setBlock4('');
      setFullEssay('');
      setSecondsElapsed(0);
      setIsTimerRunning(true);

      // Mặc định đóng tất cả accordion
      setShowGuidingQuestions(false);
      setShowOutline(false);
      setShowVocab(false);
      setShowLivePreview(false);
      setStep('writing');

      // Cuộn lên đầu trang
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo đề bài.';
      setPromptError(message);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Select a preset topic
  const handleSelectPreset = (preset: typeof POPULAR_WRITING_TOPICS[0]) => {
    setCustomTopic(preset.topic);
    setSelectedLevel(preset.level);
    setTargetWords(preset.wordCount);
    handleGeneratePrompt(preset.topic, preset.level, preset.wordCount);
  };

  // Submit Essay for Evaluation
  const handleSubmitEssay = async () => {
    const finalEssayToSubmit = writingMode === 'block' ? assembledEssay : fullEssay;

    if (!finalEssayToSubmit.trim()) {
      alert('Vui lòng viết nội dung bài trước khi nộp!');
      return;
    }

    setIsEvaluating(true);
    setIsTimerRunning(false);

    try {
      const result = await evaluateEssay(
        promptData?.topic || customTopic,
        promptData?.prompt || '',
        finalEssayToSubmit,
        promptData?.level || selectedLevel
      );
      setEvalResult(result);
      setStep('result');

      // Auto save to history if possible
      try {
        setIsSaving(true);
        await saveWritingHistory({
          topic: promptData?.topic || customTopic,
          level: promptData?.level || selectedLevel,
          writingType: 'TOPIC_WRITING',
          promptText: promptData?.prompt || '',
          essayContent: finalEssayToSubmit,
          outlineData: promptData?.outline || null,
          feedbackData: result,
          score: result.overallScore,
          wordCount: result.wordCount || countWords(finalEssayToSubmit),
        });
        setIsSaved(true);
      } catch (saveErr) {
        console.warn('Could not auto save to backend:', saveErr);
      } finally {
        setIsSaving(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi gửi bài cho AI chấm điểm.';
      alert(`Đã xảy ra lỗi: ${message}`);
      setIsTimerRunning(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Retry / Reset
  const handleRetry = () => {
    setBlock1('');
    setBlock2('');
    setBlock3('');
    setBlock4('');
    setFullEssay('');
    setSecondsElapsed(0);
    setIsTimerRunning(true);
    setEvalResult(null);
    setIsSaved(false);
    setShowGuidingQuestions(false);
    setShowOutline(false);
    setShowVocab(false);
    setStep('writing');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNewTopic = () => {
    setStep('setup');
    setPromptData(null);
    setBlock1('');
    setBlock2('');
    setBlock3('');
    setBlock4('');
    setFullEssay('');
    setEvalResult(null);
    setIsSaved(false);
    setShowGuidingQuestions(false);
    setShowOutline(false);
    setShowVocab(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(currentEssay);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-body">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <PenTool className="text-indigo-400" size={26} />
            Luyện Viết Tiếng Anh
          </h1>
        </div>

        {step !== 'setup' && (
          <button
            onClick={handleNewTopic}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>Chọn chủ đề khác</span>
          </button>
        )}
      </div>

      {/* STEP 1: SETUP TOPIC */}
      {step === 'setup' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Custom Topic Input Card */}
          <div className="bg-surface-800 border border-white/[0.08] rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles size={20} className="text-accent-indigo-light" />
                1. Nhập chủ đề bạn muốn luyện viết
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Chủ đề / Ý tưởng của bạn
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Ví dụ: Lợi ích của việc học ngoại ngữ từ sớm, Ảnh hưởng của AI, Du lịch tự túc..."
                  className="w-full px-4 py-3.5 rounded-xl bg-surface-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo transition-all text-[15px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGeneratePrompt();
                  }}
                />
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Level selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Trình độ mục tiêu
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['A2', 'B1', 'B2', 'C1'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSelectedLevel(lvl)}
                        className={`py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                          selectedLevel === lvl
                            ? 'bg-accent-indigo text-white shadow-md shadow-accent-indigo/20 border border-accent-indigo-light'
                            : 'bg-surface-900 text-slate-400 border border-white/5 hover:bg-white/[0.04] hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target words */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Mục tiêu số từ: <span className="text-accent-indigo-light font-bold">{targetWords} từ</span>
                  </label>
                  <input
                    type="range"
                    min="80"
                    max="350"
                    step="10"
                    value={targetWords}
                    onChange={(e) => setTargetWords(Number(e.target.value))}
                    className="w-full accent-accent-indigo h-2 bg-surface-900 rounded-lg cursor-pointer mt-3"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>Ngắn (80 từ)</span>
                    <span>Chuẩn (150-200 từ)</span>
                    <span>Dài (350 từ)</span>
                  </div>
                </div>
              </div>

              {/* Writing Mode Selection (4 Khối vs Tự do liền mạch) */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  2. Chọn phương pháp viết
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Mode 1: 4 Blocks (Default) */}
                  <button
                    type="button"
                    onClick={() => setWritingMode('block')}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                      writingMode === 'block'
                        ? 'bg-accent-indigo/15 border-accent-indigo text-white shadow-md shadow-accent-indigo/15 ring-1 ring-accent-indigo/50'
                        : 'bg-surface-900/80 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg flex-shrink-0 ${
                      writingMode === 'block' ? 'bg-accent-indigo text-white' : 'bg-surface-800 text-slate-400'
                    }`}>
                      <LayoutGrid size={20} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${writingMode === 'block' ? 'text-white' : 'text-slate-200'}`}>
                          Viết theo 4 Khối
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Khuyên dùng
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Chia bài viết thành 4 khối (Mở bài, Luận điểm 1, Luận điểm 2, Kết luận) kèm gợi ý chi tiết.
                      </p>
                    </div>
                  </button>

                  {/* Mode 2: Continuous / Full */}
                  <button
                    type="button"
                    onClick={() => setWritingMode('full')}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                      writingMode === 'full'
                        ? 'bg-accent-indigo/15 border-accent-indigo text-white shadow-md shadow-accent-indigo/15 ring-1 ring-accent-indigo/50'
                        : 'bg-surface-900/80 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg flex-shrink-0 ${
                      writingMode === 'full' ? 'bg-accent-indigo text-white' : 'bg-surface-800 text-slate-400'
                    }`}>
                      <AlignLeft size={20} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${writingMode === 'full' ? 'text-white' : 'text-slate-200'}`}>
                          Viết tự do liền mạch
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300">
                          Tự do
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Viết trên một khung văn bản duy nhất, có danh sách câu hỏi gợi ý và xem trước bài viết.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {promptError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{promptError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleGeneratePrompt()}
                disabled={isGeneratingPrompt}
                className="w-full py-4 rounded-xl bg-accent-indigo hover:bg-accent-indigo-light text-white font-bold text-[15px] shadow-lg shadow-accent-indigo/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGeneratingPrompt ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI đang tạo đề bài...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>
                      {writingMode === 'block'
                        ? 'Tạo đề bài & Viết theo 4 khối'
                        : 'Tạo đề bài & Viết tự do liền mạch'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Popular Topics Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-400" />
              Hoặc chọn nhanh chủ đề mẫu:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {POPULAR_WRITING_TOPICS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(item)}
                  disabled={isGeneratingPrompt}
                  className="bg-surface-800/80 hover:bg-surface-800 border border-white/[0.06] hover:border-accent-indigo/40 rounded-2xl p-5 text-left transition-all hover:scale-[1.01] flex flex-col justify-between group space-y-3 cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {item.category}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        Level {item.level}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {item.topic}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs text-slate-500">
                    <span>Mục tiêu ~{item.wordCount} từ</span>
                    <span className="text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Bắt đầu <ArrowLeft size={12} className="rotate-180" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: WRITING ROOM */}
      {step === 'writing' && promptData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Left Column: Prompt Info & Reference Accordions (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Prompt Card */}
            <div className="bg-surface-800 border border-white/[0.08] rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Đề bài viết
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Level {promptData.level}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white leading-snug">
                {promptData.title}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed bg-surface-900/60 p-3.5 rounded-xl border border-white/[0.04]">
                {promptData.prompt}
              </p>
            </div>

            {/* Guiding Questions Card (Chỉ hiển thị khi ở chế độ Viết tự do liền mạch) */}
            {writingMode === 'full' && promptData.guidingQuestions && promptData.guidingQuestions.length > 0 && (
              <div className="bg-surface-800 border border-white/[0.08] rounded-2xl p-4 space-y-3 shadow-lg">
                <div
                  className="flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setShowGuidingQuestions(!showGuidingQuestions)}
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb size={16} className="text-amber-400" />
                    <h4 className="text-sm font-bold text-white">
                      Câu hỏi định hướng phát triển ý
                    </h4>
                  </div>
                  <button type="button" className="text-slate-400 hover:text-white cursor-pointer">
                    {showGuidingQuestions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {showGuidingQuestions && (
                  <div className="pt-2">
                    <ul className="space-y-2 pl-4 list-disc text-xs text-slate-300">
                      {promptData.guidingQuestions.map((q, idx) => (
                        <li key={idx} className="leading-relaxed">{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Suggested Vocabulary Card (Accordion - Mặc định ĐÓNG) */}
            {promptData.vocabularyHints && promptData.vocabularyHints.length > 0 && (
              <div className="bg-surface-800 border border-white/[0.08] rounded-2xl p-4 space-y-3 shadow-lg">
                <div
                  className="flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setShowVocab(!showVocab)}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">
                      Từ vựng gợi ý hữu ích ({promptData.vocabularyHints.length})
                    </h4>
                  </div>
                  <button type="button" className="text-slate-400 hover:text-white cursor-pointer">
                    {showVocab ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {showVocab && (
                  <div className="space-y-2 pt-1 max-h-[320px] overflow-y-auto pr-1">
                    {promptData.vocabularyHints.map((v, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-surface-900/60 border border-white/[0.04] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-300 font-mono text-sm">{v.word}</span>
                          <span className="text-slate-400 italic">{v.meaning}</span>
                        </div>
                        {v.example && (
                          <p className="text-[11px] text-slate-400">
                            &quot;{v.example}&quot;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Live Preview Full Essay Box in Left Column (Chỉ hiển thị khi ở chế độ Viết tự do liền mạch) */}
            {writingMode === 'full' && (
              <div className="bg-surface-800/80 border border-white/[0.08] rounded-2xl p-4 space-y-3">
                <div
                  className="flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setShowLivePreview(!showLivePreview)}
                >
                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-indigo-400" />
                    <h4 className="text-sm font-bold text-white">
                      Xem trước bài viết ({totalWordCount} từ)
                    </h4>
                  </div>
                  <button type="button" className="text-slate-400 hover:text-white">
                    {showLivePreview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {showLivePreview && (
                  <div className="space-y-2 pt-2">
                    <div className="p-3.5 rounded-xl bg-surface-900/90 border border-white/[0.04] text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap max-h-[260px] overflow-y-auto">
                      {currentEssay.trim() || <span className="text-slate-500 italic">Bài viết chưa có nội dung. Hãy nhập vào ô bên cạnh.</span>}
                    </div>
                    {currentEssay.trim() && (
                      <button
                        onClick={handleCopyPreview}
                        className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {copiedPreview ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span>{copiedPreview ? 'Đã sao chép' : 'Sao chép bài viết'}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Outline-based Block Editor (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Top Toolbar: Mode Switcher & Stats */}
            <div className="bg-surface-800 border border-white/[0.08] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              {/* Mode Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-surface-950 border border-white/5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('block')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    writingMode === 'block'
                      ? 'bg-accent-indigo text-white shadow-md shadow-accent-indigo/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid size={14} />
                  <span>Viết theo 4 Khối (Khuyên dùng)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchMode('full')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    writingMode === 'full'
                      ? 'bg-accent-indigo text-white shadow-md shadow-accent-indigo/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <AlignLeft size={14} />
                  <span>Viết tự do liền mạch</span>
                </button>
              </div>

              {/* Stats: Timer & Words */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock size={15} className="text-indigo-400" />
                  <span className="font-mono font-bold text-sm">{formatTime(secondsElapsed)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Target size={15} className="text-emerald-400" />
                  <span className="text-slate-400">Tổng số từ:</span>
                  <span className={`font-mono font-bold text-sm ${
                    totalWordCount >= (promptData.targetWordCount || 150)
                      ? 'text-emerald-400'
                      : 'text-white'
                  }`}>
                    {totalWordCount}
                  </span>
                  <span className="text-slate-500">/ {promptData.targetWordCount || 150}</span>
                </div>
              </div>
            </div>

            {/* BLOCK MODE: 4 STRUCTURED CARDS */}
            {writingMode === 'block' ? (
              <div className="space-y-4">
                {/* BLOCK 1: Topic Sentence (Câu chủ đề / Mở bài) */}
                <div className="bg-surface-800 border border-indigo-500/20 rounded-2xl p-5 space-y-3 shadow-md hover:border-indigo-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold font-mono text-xs border border-indigo-500/30">
                        Block 1
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        Topic Sentence (Câu chủ đề & Mở bài)
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {countWords(block1)} từ
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Giới thiệu bối cảnh (Hook) và nêu rõ luận điểm chính (Thesis statement).
                  </p>

                  {/* Block 1 Suggestions from AI */}
                  {promptData.blocks?.block1?.suggestedPoints && promptData.blocks.block1.suggestedPoints.length > 0 && (
                    <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200 space-y-1">
                      <span className="font-semibold text-indigo-300 block text-[11px] uppercase tracking-wider">
                        💡 Gợi ý triển khai từ AI:
                      </span>
                      <ul className="pl-3.5 list-disc space-y-0.5 text-slate-300">
                        {promptData.blocks.block1.suggestedPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <textarea
                    value={block1}
                    onChange={(e) => setBlock1(e.target.value)}
                    placeholder="Viết câu mở đầu và câu chủ đề (Topic Sentence) tại đây..."
                    rows={4}
                    className="w-full p-3.5 rounded-xl bg-surface-900 border border-white/10 text-white placeholder-slate-500 text-sm leading-relaxed focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo transition-all resize-y"
                  />
                </div>

                {/* BLOCK 2: Supporting Idea 1 + Example */}
                <div className="bg-surface-800 border border-emerald-500/20 rounded-2xl p-5 space-y-3 shadow-md hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold font-mono text-xs border border-emerald-500/30">
                        Block 2
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        Supporting Idea 1 + Example (Luận điểm 1 & Dẫn chứng)
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {countWords(block2)} từ
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Nêu luận cứ đầu tiên, giải thích nguyên nhân/hệ quả và đưa ví dụ thực tế.
                  </p>

                  {/* Block 2 Suggestions */}
                  {promptData.blocks?.block2?.suggestedPoints && promptData.blocks.block2.suggestedPoints.length > 0 && (
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 space-y-1">
                      <span className="font-semibold text-emerald-300 block text-[11px] uppercase tracking-wider">
                        💡 Gợi ý triển khai từ AI:
                      </span>
                      <ul className="pl-3.5 list-disc space-y-0.5 text-slate-300">
                        {promptData.blocks.block2.suggestedPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <textarea
                    value={block2}
                    onChange={(e) => setBlock2(e.target.value)}
                    placeholder="Viết luận điểm 1, giải thích và đưa ví dụ cụ thể minh họa tại đây..."
                    rows={4}
                    className="w-full p-3.5 rounded-xl bg-surface-900 border border-white/10 text-white placeholder-slate-500 text-sm leading-relaxed focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-y"
                  />
                </div>

                {/* BLOCK 3: Supporting Idea 2 + Example */}
                <div className="bg-surface-800 border border-amber-500/20 rounded-2xl p-5 space-y-3 shadow-md hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold font-mono text-xs border border-amber-500/30">
                        Block 3
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        Supporting Idea 2 + Example (Luận điểm 2 & Dẫn chứng)
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {countWords(block3)} từ
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Nêu luận cứ thứ hai (hoặc phản biện/góc nhìn bổ sung) kèm dẫn chứng.
                  </p>

                  {/* Block 3 Suggestions */}
                  {promptData.blocks?.block3?.suggestedPoints && promptData.blocks.block3.suggestedPoints.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200 space-y-1">
                      <span className="font-semibold text-amber-300 block text-[11px] uppercase tracking-wider">
                        💡 Gợi ý triển khai từ AI:
                      </span>
                      <ul className="pl-3.5 list-disc space-y-0.5 text-slate-300">
                        {promptData.blocks.block3.suggestedPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <textarea
                    value={block3}
                    onChange={(e) => setBlock3(e.target.value)}
                    placeholder="Viết luận điểm 2 và ví dụ bổ sung tại đây..."
                    rows={4}
                    className="w-full p-3.5 rounded-xl bg-surface-900 border border-white/10 text-white placeholder-slate-500 text-sm leading-relaxed focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-y"
                  />
                </div>

                {/* BLOCK 4: Conclusion */}
                <div className="bg-surface-800 border border-purple-500/20 rounded-2xl p-5 space-y-3 shadow-md hover:border-purple-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 font-bold font-mono text-xs border border-purple-500/30">
                        Block 4
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        Conclusion (Kết bài & Khẳng định quan điểm)
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {countWords(block4)} từ
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Tóm tắt lại các ý chính đã nêu và đưa ra lời khuyên hoặc kết luận cuối cùng.
                  </p>

                  {/* Block 4 Suggestions */}
                  {promptData.blocks?.block4?.suggestedPoints && promptData.blocks.block4.suggestedPoints.length > 0 && (
                    <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 space-y-1">
                      <span className="font-semibold text-purple-300 block text-[11px] uppercase tracking-wider">
                        💡 Gợi ý triển khai từ AI:
                      </span>
                      <ul className="pl-3.5 list-disc space-y-0.5 text-slate-300">
                        {promptData.blocks.block4.suggestedPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <textarea
                    value={block4}
                    onChange={(e) => setBlock4(e.target.value)}
                    placeholder="Viết kết bài tóm tắt và khẳng định lại quan điểm tại đây..."
                    rows={3}
                    className="w-full p-3.5 rounded-xl bg-surface-900 border border-white/10 text-white placeholder-slate-500 text-sm leading-relaxed focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-y"
                  />
                </div>
              </div>
            ) : (
              /* FULL ESSAY CANVAS MODE */
              <div className="bg-surface-800 border border-white/[0.08] rounded-2xl p-6 space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.04] text-xs text-slate-400">
                  <span>Chế độ viết tự do liền mạch</span>
                  <span>{countWords(fullEssay)} từ</span>
                </div>
                <textarea
                  value={fullEssay}
                  onChange={(e) => setFullEssay(e.target.value)}
                  placeholder="Viết toàn bộ bài luận tiếng Anh của bạn tại đây..."
                  rows={16}
                  className="w-full p-4 rounded-xl bg-surface-900/90 border border-white/10 text-white placeholder-slate-500 font-sans leading-relaxed text-[15px] focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo transition-all resize-y"
                />
              </div>
            )}

            {/* Bottom Submit Actions Bar */}
            <div className="p-5 rounded-2xl bg-surface-800 border border-white/[0.08] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                {totalWordCount < 30 ? (
                  <span className="text-amber-400 font-medium">
                    💡 Hãy hoàn thiện các khối để bài viết đạt đủ độ dài (tối thiểu 30 từ).
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">
                    ✅ Các khối đã sẵn sàng để AI chấm điểm và nhận xét chi tiết.
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmitEssay}
                disabled={isEvaluating || totalWordCount < 10}
                className="px-8 py-3.5 rounded-xl bg-accent-indigo hover:bg-accent-indigo-light text-white font-bold text-sm shadow-lg shadow-accent-indigo/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isEvaluating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI đang phân tích & chữa bài...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Nộp bài & Nhận xét AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: EVALUATION RESULT */}
      {step === 'result' && evalResult && (
        <WritingFeedbackResult
          result={evalResult}
          essayContent={currentEssay}
          topic={promptData?.topic || customTopic}
          onRetry={handleRetry}
          isSaving={isSaving}
          isSaved={isSaved}
        />
      )}
    </div>
  );
};

export default TopicWritingView;
