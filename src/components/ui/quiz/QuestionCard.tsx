import React from 'react';
import { Volume2 } from 'lucide-react';
import OptionButton from './OptionButton';
import { Question } from '@/types/quiz';

interface QuestionCardProps {
    currentIndex: number;
    question: Question;
    selectedAnswer?: number;
    isAnswered: boolean;
    onSelect: (index: number) => void;
    onPlaySound?: (text: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
    currentIndex,
    question,
    selectedAnswer,
    isAnswered,
    onSelect,
    onPlaySound,
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <p className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-widest">
                Câu {currentIndex + 1}
            </p>
            <div className="text-center py-4 mb-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Chọn nghĩa đúng của từ:</p>
                <div className="flex items-center justify-center gap-3">
                    <h2 className="text-4xl font-bold text-blue-700">{question.word}</h2>
                    <button
                        onClick={() => onPlaySound?.(question.word)}
                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-white rounded-full transition shadow-sm"
                        title="Đọc từ này"
                    >
                        <Volume2 size={24} />
                    </button>
                </div>
                {question.pronunciation && (
                    <p className="text-sm text-gray-400 mt-1">{question.pronunciation}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {question.options.map((option, index) => (
                    <OptionButton
                        key={index}
                        label={option}
                        index={index}
                        selectedIndex={selectedAnswer}
                        correctIndex={question.correctIndex}
                        isAnswered={isAnswered}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        </div>
    );
};

export default QuestionCard;
