'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/store';
import { Question } from '@/types/quiz';

// Components
import ResultScreen from '@/components/ui/quiz/ResultScreen';
import QuizEmptyState from '@/components/ui/quiz/QuizEmptyState';
import QuizHeader from '@/components/ui/quiz/QuizHeader';
import QuestionCard from '@/components/ui/quiz/QuestionCard';
import QuizFeedback from '@/components/ui/quiz/QuizFeedback';

// ─── Helpers ────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuestions(
    cards: { id: string; word: string; meaning: string; pronunciation?: string }[],
    fallbackPool: { id: string; word: string; meaning: string; pronunciation?: string }[] = []
): Question[] {
    if (cards.length === 0) return [];

    // Gộp pool nhiễu: dùng cards trước, bổ sung fallback nếu thiếu
    const distractorPool = [
        ...cards,
        ...fallbackPool.filter((f) => !cards.find((c) => c.id === f.id)),
    ];

    return shuffle(cards).map((card) => {
        const wrongPool = distractorPool.filter((c) => c.id !== card.id);
        const wrongOptions = shuffle(wrongPool).slice(0, 3).map((c) => c.meaning);
        const correctIndex = Math.floor(Math.random() * 4);
        const options = [...wrongOptions];
        options.splice(correctIndex, 0, card.meaning);

        return {
            cardId: card.id,
            word: card.word,
            pronunciation: card.pronunciation,
            options,
            correctIndex,
        };
    });
}

// ─── Main QuizPage ───────────────────────────────────────────────────────────

export const QuizPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setId = searchParams.get('setId');

    const sets = useAppSelector((state) => state.flashcard.sets);
    const currentSet = sets.find((s) => s.id === setId);
    const cards = currentSet?.cards ?? [];

    const [questions, setQuestions] = useState<Question[]>(() => buildQuestions(cards));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>();
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [wrongCardIds, setWrongCardIds] = useState<string[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [isRetryRound, setIsRetryRound] = useState(false);

    const question = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;

    const handleSelect = useCallback(
        (index: number) => {
            if (isAnswered) return;
            setSelectedAnswer(index);
            setIsAnswered(true);
            if (index === question.correctIndex) {
                setScore((s) => s + 1);
            } else {
                setWrongCardIds((prev) =>
                    prev.includes(question.cardId) ? prev : [...prev, question.cardId]
                );
            }
        },
        [isAnswered, question]
    );

    const handleNext = useCallback(() => {
        if (isLastQuestion) {
            setIsFinished(true);
        } else {
            setCurrentIndex((i) => i + 1);
            setSelectedAnswer(undefined);
            setIsAnswered(false);
        }
    }, [isLastQuestion]);

    const handleRetryAll = useCallback(() => {
        setQuestions(buildQuestions(cards));
        setCurrentIndex(0);
        setSelectedAnswer(undefined);
        setIsAnswered(false);
        setScore(0);
        setWrongCardIds([]);
        setIsFinished(false);
        setIsRetryRound(false);
    }, [cards]);

    const handleRetryWrong = useCallback(() => {
        const wrongCards = cards.filter((c) => wrongCardIds.includes(c.id));
        setQuestions(buildQuestions(wrongCards, cards));
        setCurrentIndex(0);
        setSelectedAnswer(undefined);
        setIsAnswered(false);
        setScore(0);
        setWrongCardIds([]);
        setIsFinished(false);
        setIsRetryRound(true);
    }, [cards, wrongCardIds]);

    const handleBack = useCallback(() => {
        router.push('/');
    }, [router]);

    // ── Render States ──

    if (!currentSet) {
        return (
            <QuizEmptyState
                emoji="😕"
                title="Không tìm thấy bộ flashcard"
                description="Bộ từ này không tồn tại hoặc đã bị xóa."
                buttonText="← Về trang chủ"
                onButtonClick={handleBack}
            />
        );
    }

    if (cards.length < 4) {
        return (
            <QuizEmptyState
                emoji="📭"
                title="Chưa đủ từ để quiz"
                description={
                    <>
                        Bộ <strong>{currentSet.name}</strong> chỉ có <strong>{cards.length}</strong> từ.
                        Cần ít nhất <strong>4 từ</strong> để có đủ đáp án trắc nghiệm.
                    </>
                }
                buttonText="← Quay lại"
                onButtonClick={handleBack}
            />
        );
    }

    if (isFinished) {
        return (
            <ResultScreen
                score={score}
                total={questions.length}
                wrongCardIds={wrongCardIds}
                setName={currentSet.name}
                setEmoji={currentSet.emoji ?? '📦'}
                isRetryRound={isRetryRound}
                onRetryAll={handleRetryAll}
                onRetryWrong={handleRetryWrong}
                onBack={handleBack}
            />
        );
    }

    const progressPercent = Math.round((currentIndex / questions.length) * 100);

    return (
        <div className="min-h-screen bg-gray-50 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto space-y-6 -mt-2">
                <QuizHeader
                    onBack={handleBack}
                    currentSetName={currentSet.name}
                    currentSetEmoji={currentSet.emoji ?? '📦'}
                    currentIndex={currentIndex}
                    totalQuestions={questions.length}
                    progressPercent={progressPercent}
                    isRetryRound={isRetryRound}
                />

                {/* Live score */}
                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold px-3 py-1 bg-red-50 text-red-500 rounded-full">
                        ❌ {wrongCardIds.length} sai
                    </span>
                    <span className="text-sm font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">
                        ✅ {score} đúng
                    </span>
                </div>

                <QuestionCard
                    currentIndex={currentIndex}
                    question={question}
                    selectedAnswer={selectedAnswer}
                    isAnswered={isAnswered}
                    onSelect={handleSelect}
                />

                {isAnswered && (
                    <QuizFeedback
                        isCorrect={selectedAnswer === question.correctIndex}
                        correctOptionLabel={question.options[question.correctIndex]}
                        isLastQuestion={isLastQuestion}
                        onNext={handleNext}
                    />
                )}
            </div>
        </div>
    );
};

export default QuizPage;