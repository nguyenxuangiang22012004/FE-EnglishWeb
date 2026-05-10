'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FlashcardSet } from '@/store/slices/flashcardSlice';
import { getFlashcardSetById } from '@/services/flashcardData';
import { Question } from '@/types/quiz';
import ResultScreen from '@/components/ui/quiz/ResultScreen';
import QuizEmptyState from '@/components/ui/quiz/QuizEmptyState';
import QuizHeader from '@/components/ui/quiz/QuizHeader';
import QuestionCard from '@/components/ui/quiz/QuestionCard';
import QuizFeedback from '@/components/ui/quiz/QuizFeedback';
import { useTextToSpeech } from '@/components/hooks/useTextToSpeech';

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function buildQuestions(cards: { id: string; word: string; meaning: string; pronunciation?: string }[], fallbackPool: { id: string; word: string; meaning: string; pronunciation?: string }[] = []): Question[] {
    if (cards.length === 0) return [];
    const distractorPool = [...cards, ...fallbackPool.filter((f) => !cards.find((c) => c.id === f.id))];
    return shuffle(cards).map((card) => {
        const wrongPool = distractorPool.filter((c) => c.id !== card.id);
        const wrongOptions = shuffle(wrongPool).slice(0, 3).map((c) => c.meaning);
        const correctIndex = Math.floor(Math.random() * 4);
        const options = [...wrongOptions];
        options.splice(correctIndex, 0, card.meaning);
        return { cardId: card.id, word: card.word, pronunciation: card.pronunciation, options, correctIndex };
    });
}

export const QuizPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setId = searchParams.get('setId');
    const filter = searchParams.get('filter') || 'all';
    const { speak } = useTextToSpeech();

    const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>();
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [wrongCardIds, setWrongCardIds] = useState<string[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [isRetryRound, setIsRetryRound] = useState(false);

    useEffect(() => {
        const fetchSet = async () => {
            if (!setId) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            const data = await getFlashcardSetById(setId);
            if (data) {
                setCurrentSet(data);
                const fullCards = data.cards ?? [];
                const quizCards = filter === 'all' ? fullCards : fullCards.filter(c => (c as any).status === filter || (!(c as any).status && filter === 'unknown'));
                setQuestions(buildQuestions(quizCards, fullCards));
            }
            setIsLoading(false);
        };
        fetchSet();
    }, [setId, filter]);

    const fullCards = currentSet?.cards ?? [];
    const quizCards = filter === 'all' ? fullCards : fullCards.filter(c => (c as any).status === filter || (!(c as any).status && filter === 'unknown'));

    const question = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;

    const handleSelect = useCallback((index: number) => {
        if (isAnswered || !question) return;
        setSelectedAnswer(index);
        setIsAnswered(true);
        if (index === question.correctIndex) { setScore((s) => s + 1); }
        else { setWrongCardIds((prev) => prev.includes(question.cardId) ? prev : [...prev, question.cardId]); }
    }, [isAnswered, question]);

    const handleNext = useCallback(() => {
        if (isLastQuestion) { setIsFinished(true); }
        else { setCurrentIndex((i) => i + 1); setSelectedAnswer(undefined); setIsAnswered(false); }
    }, [isLastQuestion]);

    const handleRetryAll = useCallback(() => { setQuestions(buildQuestions(quizCards, fullCards)); setCurrentIndex(0); setSelectedAnswer(undefined); setIsAnswered(false); setScore(0); setWrongCardIds([]); setIsFinished(false); setIsRetryRound(false); }, [quizCards, fullCards]);
    const handleRetryWrong = useCallback(() => { const wrongCards = quizCards.filter((c) => wrongCardIds.includes(c.id)); setQuestions(buildQuestions(wrongCards, fullCards)); setCurrentIndex(0); setSelectedAnswer(undefined); setIsAnswered(false); setScore(0); setWrongCardIds([]); setIsFinished(false); setIsRetryRound(true); }, [quizCards, fullCards, wrongCardIds]);
    const handleBack = useCallback(() => { router.push('/flashcards'); }, [router]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-surface-900">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <span className="ml-3 text-slate-400">Đang tải câu hỏi...</span>
            </div>
        );
    }

    if (!currentSet) return <QuizEmptyState emoji="😕" title="Không tìm thấy bộ flashcard" description="Bộ từ này không tồn tại hoặc đã bị xóa." buttonText="Về trang chủ" onButtonClick={handleBack} />;
    if (fullCards.length < 4) return <QuizEmptyState emoji="📭" title="Chưa đủ từ để quiz" description={<>Bộ <strong>{currentSet.name}</strong> chỉ có <strong>{fullCards.length}</strong> từ. Cần ít nhất <strong>4 từ</strong>.</>} buttonText="Quay lại" onButtonClick={handleBack} />;
    if (quizCards.length === 0 || questions.length === 0) return <QuizEmptyState emoji="📭" title="Không có từ để quiz" description={<>Bộ lọc {filter} hiện tại không có từ vựng nào.</>} buttonText="Quay lại" onButtonClick={handleBack} />;
    if (isFinished) return <ResultScreen score={score} total={questions.length} wrongCardIds={wrongCardIds} setName={currentSet.name} setEmoji={currentSet.emoji ?? '📦'} isRetryRound={isRetryRound} onRetryAll={handleRetryAll} onRetryWrong={handleRetryWrong} onBack={handleBack} />;

    const progressPercent = Math.round((currentIndex / questions.length) * 100);

    return (
        <div className="min-h-screen bg-surface-900 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto space-y-6 -mt-2">
                <QuizHeader onBack={handleBack} currentSetName={currentSet.name} currentSetEmoji={currentSet.emoji ?? '📦'} currentIndex={currentIndex} totalQuestions={questions.length} progressPercent={progressPercent} isRetryRound={isRetryRound} />
                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold px-3 py-1.5 bg-accent-rose/10 text-accent-rose rounded-xl">❌ {wrongCardIds.length} sai</span>
                    <span className="text-sm font-semibold px-3 py-1.5 bg-accent-emerald/10 text-accent-emerald rounded-xl">✅ {score} đúng</span>
                </div>
                {question && <QuestionCard currentIndex={currentIndex} question={question} selectedAnswer={selectedAnswer} isAnswered={isAnswered} onSelect={handleSelect} onPlaySound={speak} />}
                {isAnswered && question && <QuizFeedback isCorrect={selectedAnswer === question.correctIndex} correctOptionLabel={question.options[question.correctIndex]} isLastQuestion={isLastQuestion} onNext={handleNext} />}
            </div>
        </div>
    );
};

export default QuizPage;