import React from 'react';

interface QuizHeaderProps {
    onBack: () => void;
    currentSetName: string;
    currentSetEmoji: string;
    currentIndex: number;
    totalQuestions: number;
    progressPercent: number;
    isRetryRound: boolean;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({
    onBack,
    currentSetName,
    currentSetEmoji,
    currentIndex,
    totalQuestions,
    progressPercent,
    isRetryRound,
}) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition text-sm font-medium"
                >
                    ← Thoát
                </button>
                <span className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                    {currentSetEmoji} {currentSetName}
                    {isRetryRound && (
                        <span className="text-xs font-semibold px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
                            Luyện lại câu sai
                        </span>
                    )}
                </span>
                <span className="text-sm text-gray-500">
                    {currentIndex + 1} / {totalQuestions}
                </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
};

export default QuizHeader;
