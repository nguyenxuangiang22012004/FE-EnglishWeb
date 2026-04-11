import React from 'react';
import OptionButton from './OptionButton';
import { Question } from '@/types/quiz';

interface QuestionCardProps {
    currentIndex: number;
    question: Question;
    selectedAnswer?: number;
    isAnswered: boolean;
    onSelect: (index: number) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
    currentIndex,
    question,
    selectedAnswer,
    isAnswered,
    onSelect,
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <p className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-widest">
                Câu {currentIndex + 1}
            </p>
            <div className="text-center py-4 mb-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Chọn nghĩa đúng của từ:</p>
                <h2 className="text-4xl font-bold text-blue-700">{question.word}</h2>
                {question.pronunciation && (
                    <p className="text-sm text-gray-400 mt-1">{question.pronunciation}</p>
                )}
            </div>

            <div className="space-y-3">
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
