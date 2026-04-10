'use client';

import React, { useState } from 'react';
import { QuizCard } from '@/components/ui/QuizCard';

const mockQuestions = [
    {
        word: 'Apple',
        options: ['Bánh mì', 'Quả táo', 'Chuối', 'Cam'],
        correct: 1,
    },
    {
        word: 'Beautiful',
        options: ['Xấu xí', 'Xinh đẹp', 'Bình thường', 'Tệ'],
        correct: 1,
    },
    {
        word: 'Courage',
        options: ['Sợ hãi', 'Yếu đuối', 'Dũng cảm', 'Hèn nhát'],
        correct: 2,
    },
];

export const QuizPage: React.FC = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>();
    const [isAnswered, setIsAnswered] = useState(false);

    const question = mockQuestions[currentQuestion];
    const isLastQuestion = currentQuestion === mockQuestions.length - 1;

    const handleSelectAnswer = (index: number) => {
        if (!isAnswered) {
            setSelectedAnswer(index);
            setIsAnswered(true);
            if (index === question.correct) {
                setScore(score + 1);
            }
        }
    };

    const handleNextQuestion = () => {
        if (isLastQuestion) {
            // Show results
            console.log('Quiz complete! Score:', score);
        } else {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(undefined);
            setIsAnswered(false);
        }
    };

    if (!isAnswered && isLastQuestion && selectedAnswer !== undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Hoàn thành!</h1>
                    <p className="text-2xl text-blue-600 font-bold mb-6">
                        Điểm: {score}/{mockQuestions.length}
                    </p>
                    <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                        ← Quay lại Flashcards
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">🎯 Bài Tập Trắc Nghiệm</h1>
            <QuizCard
                questionNum={currentQuestion + 1}
                totalQuestions={mockQuestions.length}
                word={question.word}
                options={question.options}
                selectedOption={selectedAnswer}
                correctOption={question.correct}
                onSelect={handleSelectAnswer}
                isAnswered={isAnswered}
            />
            {isAnswered && (
                <button
                    onClick={handleNextQuestion}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                    {isLastQuestion ? 'Xem Kết Quả' : 'Tiếp Tục'}
                </button>
            )}
        </div>
    );
};

export default QuizPage;
