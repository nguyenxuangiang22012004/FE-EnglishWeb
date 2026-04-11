'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/store';

// ─── Helpers ────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
}

interface Question {
    cardId: string;
    word: string;
    pronunciation?: string;
    options: string[];
    correctIndex: number;
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

// ─── OptionButton ────────────────────────────────────────────────────────────

interface OptionButtonProps {
    label: string;
    index: number;
    selectedIndex?: number;
    correctIndex: number;
    isAnswered: boolean;
    onSelect: (index: number) => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const OptionButton: React.FC<OptionButtonProps> = ({
    label,
    index,
    selectedIndex,
    correctIndex,
    isAnswered,
    onSelect,
}) => {
    const isSelected = selectedIndex === index;
    const isCorrect = correctIndex === index;
    const isWrong = isSelected && !isCorrect;

    let classes =
        'w-full p-4 text-left rounded-xl transition-all duration-200 border-2 flex items-center gap-3 font-medium ';

    if (!isAnswered) {
        classes += isSelected
            ? 'border-blue-500 bg-blue-50 text-blue-800'
            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-gray-800 cursor-pointer';
    } else {
        if (isCorrect) classes += 'border-green-500 bg-green-50 text-green-800';
        else if (isWrong) classes += 'border-red-400 bg-red-50 text-red-800';
        else classes += 'border-gray-200 bg-white text-gray-400';
    }

    const dotClass = [
        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
        !isAnswered && isSelected ? 'bg-blue-500 text-white' : '',
        !isAnswered && !isSelected ? 'bg-gray-100 text-gray-500' : '',
        isAnswered && isCorrect ? 'bg-green-500 text-white' : '',
        isAnswered && isWrong ? 'bg-red-400 text-white' : '',
        isAnswered && !isCorrect && !isWrong ? 'bg-gray-100 text-gray-400' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            onClick={() => !isAnswered && onSelect(index)}
            disabled={isAnswered}
            className={classes}
        >
            <span className={dotClass}>
                {isAnswered && isCorrect ? '✓' : isAnswered && isWrong ? '✗' : OPTION_LABELS[index]}
            </span>
            <span>{label}</span>
        </button>
    );
};

// ─── ResultScreen ────────────────────────────────────────────────────────────

interface ResultScreenProps {
    score: number;
    total: number;
    wrongCardIds: string[];
    setName: string;
    setEmoji: string;
    isRetryRound: boolean;
    onRetryAll: () => void;
    onRetryWrong: () => void;
    onBack: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
    score,
    total,
    wrongCardIds,
    setName,
    setEmoji,
    isRetryRound,
    onRetryAll,
    onRetryWrong,
    onBack,
}) => {
    const percent = Math.round((score / total) * 100);
    const wrongCount = wrongCardIds.length;

    const grade =
        percent >= 90
            ? { emoji: '🏆', label: 'Xuất sắc!', color: 'text-yellow-600 bg-yellow-50 border-yellow-300' }
            : percent >= 70
            ? { emoji: '🎉', label: 'Tốt lắm!', color: 'text-green-700 bg-green-50 border-green-300' }
            : percent >= 50
            ? { emoji: '💪', label: 'Cố lên!', color: 'text-blue-700 bg-blue-50 border-blue-300' }
            : { emoji: '📚', label: 'Cần ôn thêm', color: 'text-orange-700 bg-orange-50 border-orange-300' };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center space-y-6">
                <div className="text-6xl">{grade.emoji}</div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">{grade.label}</h1>
                    <p className="text-gray-500 flex items-center justify-center gap-2">
                        {setEmoji} {setName}
                        {isRetryRound && (
                            <span className="text-xs font-semibold px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
                                Luyện lại câu sai
                            </span>
                        )}
                    </p>
                </div>

                {/* Score circle */}
                <div className="flex justify-center">
                    <div
                        className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center ${grade.color}`}
                    >
                        <span className="text-4xl font-bold">{percent}%</span>
                        <span className="text-sm font-medium">{score}/{total}</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-2xl font-bold text-green-600">{score}</p>
                        <p className="text-xs text-green-700">Đúng</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3">
                        <p className="text-2xl font-bold text-red-500">{wrongCount}</p>
                        <p className="text-xs text-red-600">Sai</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-2xl font-bold text-blue-600">{total}</p>
                        <p className="text-xs text-blue-700">Tổng</p>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-3">
                    {/* Nút 1: Làm lại toàn bộ */}
                    <button
                        onClick={onRetryAll}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                    >
                        🔄 Làm lại toàn bộ
                    </button>

                    {/* Nút 2: Làm lại câu sai */}
                    {wrongCount === 0 ? (
                        <div className="w-full py-3 border border-green-200 text-green-600 rounded-xl text-sm text-center bg-green-50 font-medium">
                            🎊 Không có câu sai nào!
                        </div>
                    ) : (
                        <button
                            onClick={onRetryWrong}
                            className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition"
                        >
                            ❌ Làm lại {wrongCount} câu sai
                        </button>
                    )}

                    <button
                        onClick={onBack}
                        className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                    >
                        ← Quay lại bộ từ
                    </button>
                </div>
            </div>
        </div>
    );
};

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
    // Lưu cardId của các từ trả lời sai để dùng cho "Làm lại câu sai"
    const [wrongCardIds, setWrongCardIds] = useState<string[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    // Đánh dấu đang trong vòng luyện lại câu sai
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
                // Thêm cardId vào danh sách sai (tránh trùng)
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

    // Reset toàn bộ với tất cả cards
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

    // Chỉ lấy các cards sai để build câu hỏi mới
    const handleRetryWrong = useCallback(() => {
        const wrongCards = cards.filter((c) => wrongCardIds.includes(c.id));
        // Truyền cards gốc làm fallback để có đủ đáp án nhiễu dù chỉ có 1-2 câu sai
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

    // ── Error states ──

    if (!currentSet) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center space-y-4">
                    <div className="text-5xl">😕</div>
                    <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy bộ flashcard</h2>
                    <p className="text-gray-500">Bộ từ này không tồn tại hoặc đã bị xóa.</p>
                    <button
                        onClick={handleBack}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                    >
                        ← Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    if (cards.length < 4) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center space-y-4">
                    <div className="text-5xl">📭</div>
                    <h2 className="text-2xl font-bold text-gray-800">Chưa đủ từ để quiz</h2>
                    <p className="text-gray-500">
                        Bộ <strong>{currentSet.name}</strong> chỉ có <strong>{cards.length}</strong> từ.
                        Cần ít nhất <strong>4 từ</strong> để có đủ đáp án trắc nghiệm.
                    </p>
                    <button
                        onClick={handleBack}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                    >
                        ← Quay lại
                    </button>
                </div>
            </div>
        );
    }

    // ── Result screen ──

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

    // ── Quiz screen ──

    const progressPercent = Math.round((currentIndex / questions.length) * 100);

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition text-sm font-medium"
                    >
                        ← Thoát
                    </button>
                    <span className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                        {currentSet.emoji} {currentSet.name}
                        {isRetryRound && (
                            <span className="text-xs font-semibold px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
                                Luyện lại câu sai
                            </span>
                        )}
                    </span>
                    <span className="text-sm text-gray-500">
                        {currentIndex + 1} / {questions.length}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* Live score */}
                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold px-3 py-1 bg-red-50 text-red-500 rounded-full">
                        ❌ {wrongCardIds.length} sai
                    </span>
                    <span className="text-sm font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">
                        ✅ {score} đúng
                    </span>
                </div>

                {/* Question card */}
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
                                onSelect={handleSelect}
                            />
                        ))}
                    </div>
                </div>

                {/* Feedback + Next */}
                {isAnswered && (
                    <div className="space-y-3">
                        <div
                            className={`rounded-xl p-4 text-center font-semibold text-lg ${
                                selectedAnswer === question.correctIndex
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-600'
                            }`}
                        >
                            {selectedAnswer === question.correctIndex
                                ? '🎉 Chính xác!'
                                : `❌ Sai rồi! Đáp án đúng: "${question.options[question.correctIndex]}"`}
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-lg"
                        >
                            {isLastQuestion ? '🏁 Xem kết quả' : 'Câu tiếp theo →'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizPage;