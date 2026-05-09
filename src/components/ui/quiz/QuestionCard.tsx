import React from 'react';
import { Volume2 } from 'lucide-react';
import OptionButton from './OptionButton';
import { Question } from '@/types/quiz';

interface QuestionCardProps { currentIndex: number; question: Question; selectedAnswer?: number; isAnswered: boolean; onSelect: (index: number) => void; onPlaySound?: (text: string) => void; }

const QuestionCard: React.FC<QuestionCardProps> = ({ currentIndex, question, selectedAnswer, isAnswered, onSelect, onPlaySound }) => {
    return (
        <div className="glass-card p-8">
            <p className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-widest">Câu {currentIndex + 1}</p>
            <div className="text-center py-5 mb-6 bg-gradient-to-br from-accent-indigo/10 to-purple-500/10 rounded-2xl border border-accent-indigo/10">
                <p className="text-sm text-slate-400 mb-1">Chọn nghĩa đúng của từ:</p>
                <div className="flex items-center justify-center gap-3">
                    <h2 className="text-4xl font-display font-bold text-accent-indigo-light">{question.word}</h2>
                    <button onClick={() => onPlaySound?.(question.word)} className="p-2 text-accent-indigo/60 hover:text-accent-indigo-light hover:bg-white/[0.05] rounded-full transition" title="Đọc từ này">
                        <Volume2 size={24} />
                    </button>
                </div>
                {question.pronunciation && <p className="text-sm text-slate-500 mt-1">{question.pronunciation}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                {question.options.map((option, index) => (
                    <OptionButton key={index} label={option} index={index} selectedIndex={selectedAnswer} correctIndex={question.correctIndex} isAnswered={isAnswered} onSelect={onSelect} />
                ))}
            </div>
        </div>
    );
};

export default QuestionCard;
