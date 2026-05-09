import React from 'react';

interface QuizFeedbackProps { isCorrect: boolean; correctOptionLabel: string; isLastQuestion: boolean; onNext: () => void; }

const QuizFeedback: React.FC<QuizFeedbackProps> = ({ isCorrect, correctOptionLabel, isLastQuestion, onNext }) => {
    return (
        <div className="space-y-3">
            <button onClick={onNext} className="w-full py-4 bg-gradient-to-r from-accent-indigo to-accent-indigo-light text-white rounded-xl font-semibold glow-btn text-lg">
                {isLastQuestion ? '🏁 Xem kết quả' : 'Câu tiếp theo'}
            </button>
        </div>
    );
};

export default QuizFeedback;
