'use client';

import React from 'react';

interface QuizCardProps {
    questionNum: number;
    totalQuestions: number;
    word: string;
    options: string[];
    selectedOption?: number;
    correctOption?: number;
    onSelect: (index: number) => void;
    isAnswered: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({
    questionNum,
    totalQuestions,
    word,
    options,
    selectedOption,
    correctOption,
    onSelect,
    isAnswered,
}) => {
    return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
            {/* Progress */}
            <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-gray-600">
                    Câu {questionNum} / {totalQuestions}
                </span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${(questionNum / totalQuestions) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="mb-8 text-center p-6 bg-blue-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Chọn nghĩa của từ:</p>
                <h2 className="text-4xl font-bold text-blue-600">{word}</h2>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-8">
                {options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const isCorrect = correctOption === index;
                    const isWrong = isSelected && correctOption !== index;

                    let bgColor = 'bg-gray-50 hover:bg-gray-100';
                    if (isAnswered) {
                        if (isCorrect) bgColor = 'bg-green-100 border-2 border-green-500';
                        else if (isWrong) bgColor = 'bg-red-100 border-2 border-red-500';
                    } else if (isSelected) {
                        bgColor = 'bg-blue-100 border-2 border-blue-500';
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => !isAnswered && onSelect(index)}
                            disabled={isAnswered}
                            className={`w-full p-4 text-left rounded-lg transition ${bgColor} ${isAnswered ? 'cursor-default' : 'cursor-pointer'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{option}</span>
                                {isAnswered && isCorrect && <span className="text-2xl">✅</span>}
                                {isAnswered && isWrong && <span className="text-2xl">❌</span>}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Button */}
            {isAnswered && (
                <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                    Câu tiếp theo →
                </button>
            )}
        </div>
    );
};

export default QuizCard;
