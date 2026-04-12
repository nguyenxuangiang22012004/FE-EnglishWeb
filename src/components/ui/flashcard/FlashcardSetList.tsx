'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FlashcardSet } from '@/store/slices/flashcardSlice';

interface FlashcardSetListProps {
    sets: FlashcardSet[];
}

const getProgressStats = (cards: FlashcardSet['cards']) => {
    const total = cards.length;
    const mastered = cards.filter((c) => c.status === 'mastered').length;
    const learning = cards.filter((c) => c.status === 'learning').length;
    const unknown = total - mastered - learning;
    const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;
    return { total, mastered, learning, unknown, percent };
};

export const FlashcardSetList: React.FC<FlashcardSetListProps> = ({ sets }) => {
    const router = useRouter();

    const handleSelect = (setId: string) => {
        router.push(`/flashcards/${setId}`);
    };

    const handleQuiz = (setId: string) => {
        router.push(`/quiz?setId=${setId}`);
    };

    if (sets.length === 0) {
        return (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">📭</div>
                <h2 className="text-2xl font-bold text-yellow-900 mb-2">Chưa có bộ flashcard nào</h2>
                <p className="text-yellow-700">Hãy tạo bộ flashcard đầu tiên để bắt đầu học!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sets.map((set) => {
                const { total, mastered, learning, unknown, percent } = getProgressStats(set.cards);

                return (
                    <div
                        key={set.id}
                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 p-5 border border-gray-100"
                    >
                        {/* Header — click để học */}
                        <div
                            className="flex items-center gap-3 mb-3 cursor-pointer group"
                            onClick={() => handleSelect(set.id)}
                        >
                            <span className="text-3xl">{set.emoji ?? '📦'}</span>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                                    {set.name}
                                </h3>
                                {set.description && (
                                    <p className="text-xs text-gray-500 truncate mt-0.5">{set.description}</p>
                                )}
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percent}%` }}
                            />
                        </div>

                        {/* Stats */}
                        <div className="flex justify-between text-xs font-medium mb-4">
                            <span className="text-gray-500">{total} từ</span>
                            <div className="flex gap-2">
                                <span className="text-green-600">✅ {mastered}</span>
                                <span className="text-yellow-600">📖 {learning}</span>
                                <span className="text-red-500">❌ {unknown}</span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => handleSelect(set.id)}
                                className="py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                📖 Học
                            </button>
                            <button
                                onClick={() => handleQuiz(set.id)}
                                disabled={total < 4}
                                title={total < 4 ? 'Cần ít nhất 4 từ để làm quiz' : ''}
                                className="py-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                🎯 Quiz
                            </button>
                        </div>

                        {total < 4 && (
                            <p className="text-xs text-gray-400 text-center mt-2">
                                Cần ít nhất 4 từ để làm quiz
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default FlashcardSetList;