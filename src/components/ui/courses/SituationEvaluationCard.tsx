'use client';

import React, { useState } from 'react';
import {
    CheckCircle2,
    XCircle,
    Volume2,
    RotateCcw,
    ArrowRight,
    Eye,
    EyeOff,
    Sparkles,
    MessageSquare,
    Lightbulb
} from 'lucide-react';
import { SituationEvaluationResult } from '@/services/situationEvaluationService';

interface SituationEvaluationCardProps {
    result: SituationEvaluationResult;
    onRetry: () => void;
    onNext: () => void;
}

export const SituationEvaluationCard: React.FC<SituationEvaluationCardProps> = ({
    result,
    onRetry,
    onNext
}) => {
    // Tùy chọn Bật/Tắt bản dịch tiếng Việt (Mặc định là TẮT)
    const [showTranslation, setShowTranslation] = useState(false);

    const playAudio = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="w-full max-w-2xl bg-surface-800/90 border border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl backdrop-blur animate-fadeIn">
            {/* Header: Status */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                    {result.isCorrect ? (
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                            <XCircle className="w-6 h-6" />
                        </div>
                    )}
                    <div>
                        <h3 className="text-lg font-display font-bold text-slate-100">
                            {result.isCorrect ? 'Trả lời đúng ngữ cảnh!' : 'Cần cải thiện'}
                        </h3>
                        <p className="text-xs text-slate-400">
                            Đánh giá bởi AI Chuyên Gia Ngôn Ngữ
                        </p>
                    </div>
                </div>
            </div>

            {/* User Transcript */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-accent-indigo-light" />
                    Câu bạn vừa nói:
                </p>
                <div className="flex items-center justify-between gap-3">
                    <p className="text-slate-100 text-base font-medium italic">
                        &ldquo;{result.userTranscript}&rdquo;
                    </p>
                    <button
                        onClick={() => playAudio(result.userTranscript)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors flex-shrink-0"
                        title="Nghe lại câu bạn nói"
                    >
                        <Volume2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* AI Feedback */}
            <div className="p-4 rounded-2xl bg-accent-indigo/10 border border-accent-indigo/20 space-y-1">
                <p className="text-xs font-semibold text-accent-indigo-light uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Nhận xét của AI:
                </p>
                <p className="text-slate-200 text-sm leading-relaxed">
                    {result.feedback}
                </p>
            </div>

            {/* Suggested Native Answer */}
            {result.suggestedAnswer && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5" />
                            Gợi ý câu trả lời hay hơn:
                        </p>

                        {/* Nút Bật/Tắt Bản Dịch Tiếng Việt */}
                        {result.suggestedMeaning && (
                            <button
                                onClick={() => setShowTranslation((prev) => !prev)}
                                className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/15 hover:bg-emerald-500/25 px-2.5 py-1 rounded-lg"
                            >
                                {showTranslation ? (
                                    <>
                                        <EyeOff className="w-3.5 h-3.5" />
                                        <span>Ẩn dịch tiếng Việt</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Xem dịch tiếng Việt</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                        <p className="text-slate-100 text-base font-semibold">
                            &ldquo;{result.suggestedAnswer}&rdquo;
                        </p>
                        <button
                            onClick={() => playAudio(result.suggestedAnswer)}
                            className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors flex-shrink-0"
                            title="Nghe phát âm chuẩn"
                        >
                            <Volume2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Chỉ hiển thị khi người dùng chủ động BẬT */}
                    {showTranslation && result.suggestedMeaning && (
                        <div className="pt-2 mt-2 border-t border-emerald-500/20 text-xs text-slate-300 italic animate-fadeIn">
                            &ldquo;{result.suggestedMeaning}&rdquo;
                        </div>
                    )}

                    {result.grammarNotes && (
                        <p className="text-xs text-slate-400 pt-1">
                            💡 <em>{result.grammarNotes}</em>
                        </p>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 pt-2">
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 font-semibold text-sm transition-all"
                >
                    <RotateCcw className="w-4 h-4" />
                    Thử nói lại
                </button>

                <button
                    onClick={onNext}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-accent-indigo to-accent-emerald hover:from-accent-indigo/90 hover:to-accent-emerald/90 text-white font-bold text-sm shadow-lg shadow-accent-indigo/20 transition-all hover:scale-[1.01]"
                >
                    <span>Tiếp tục</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default SituationEvaluationCard;
