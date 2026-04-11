import React from 'react';

interface QuizEmptyStateProps {
    emoji: string;
    title: string;
    description: string | React.ReactNode;
    buttonText: string;
    onButtonClick: () => void;
}

const QuizEmptyState: React.FC<QuizEmptyStateProps> = ({
    emoji,
    title,
    description,
    buttonText,
    onButtonClick,
}) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center space-y-4">
                <div className="text-5xl">{emoji}</div>
                <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                <div className="text-gray-500">{description}</div>
                <button
                    onClick={onButtonClick}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

export default QuizEmptyState;
