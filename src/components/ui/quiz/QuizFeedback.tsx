import React from 'react';

interface QuizFeedbackProps {
    isCorrect: boolean;
    correctOptionLabel: string;
    isLastQuestion: boolean;
    onNext: () => void;
}

const QuizFeedback: React.FC<QuizFeedbackProps> = ({
    isCorrect,
    correctOptionLabel,
    isLastQuestion,
    onNext,
}) => {
    return (
        <div className="space-y-3">
            {/* <div
                className={`rounded-xl p-4 text-center font-semibold text-lg ${
                    isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}
            >
                {isCorrect
                    ? '🎉 Chính xác!'
                    : `❌ Sai rồi! Đáp án đúng: "${correctOptionLabel}"`}
            </div> */}

            <button
                onClick={onNext}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-lg"
            >
                {isLastQuestion ? '🏁 Xem kết quả' : 'Câu tiếp theo →'}
            </button>
        </div>
    );
};

export default QuizFeedback;
