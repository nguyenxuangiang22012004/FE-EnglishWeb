import React from 'react';
import { X } from 'lucide-react';

interface QuizHeaderProps { onBack: () => void; currentSetName: string; currentSetEmoji: string; currentIndex: number; totalQuestions: number; progressPercent: number; isRetryRound: boolean; }

const QuizHeader: React.FC<QuizHeaderProps> = ({ onBack, currentSetName, currentSetEmoji, currentIndex, totalQuestions, progressPercent, isRetryRound }) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] rounded-lg transition" title="Thoát"><X size={20} /></button>
                <span className="text-sm font-semibold text-slate-400 flex items-center gap-1.5">
                    {currentSetEmoji} {currentSetName}
                    {isRetryRound && <span className="text-xs font-semibold px-2 py-0.5 bg-accent-amber/10 text-accent-amber rounded-full">Luyện lại câu sai</span>}
                </span>
                <span className="text-sm text-slate-500">{currentIndex + 1} / {totalQuestions}</span>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-2">
                <div className="bg-gradient-to-r from-accent-indigo to-accent-emerald h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
        </div>
    );
};

export default QuizHeader;
