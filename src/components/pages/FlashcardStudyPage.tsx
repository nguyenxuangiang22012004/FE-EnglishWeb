'use client';

import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setCurrentIndex as reduxSetCurrentIndex } from '@/store/slices/flashcardSlice';
import { FlashcardCard } from '@/components/ui/FlashcardCard';
import { FlashcardList } from '@/components/ui/FlashcardList';

export const FlashcardStudyPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const cards = useAppSelector((state) => state.flashcard.cards);
    const reduxCurrentIndex = useAppSelector((state) => state.flashcard.currentIndex);

    const [isFlipped, setIsFlipped] = useState(false);
    const [favorites, setFavorites] = useState<string[]>([]);

    // Use local state for current index to allow independent navigation
    const [currentIndex, setCurrentIndex] = useState(reduxCurrentIndex);

    const currentCard = cards[currentIndex];

    const handleNext = () => {
        const newIndex = (currentIndex + 1) % cards.length;
        setCurrentIndex(newIndex);
        dispatch(reduxSetCurrentIndex(newIndex));
        setIsFlipped(false);
    };

    const handlePrev = () => {
        const newIndex = (currentIndex - 1 + cards.length) % cards.length;
        setCurrentIndex(newIndex);
        dispatch(reduxSetCurrentIndex(newIndex));
        setIsFlipped(false);
    };

    const handleToggleFavorite = () => {
        setFavorites((prev) =>
            prev.includes(currentCard.id)
                ? prev.filter((id) => id !== currentCard.id)
                : [...prev, currentCard.id]
        );
    };

    // Show empty state if no cards
    if (cards.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="text-4xl font-bold text-gray-800">📚 Học Flashcard</h1>
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-8 text-center">
                    <div className="text-5xl mb-4">📭</div>
                    <h2 className="text-2xl font-bold text-yellow-900 mb-2">Chưa có flashcard nào</h2>
                    <p className="text-yellow-800 mb-6">Hãy tạo hoặc import flashcard để bắt đầu học</p>
                    <div className="flex gap-4 justify-center">
                        <a
                            href="/create"
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                        >
                            ➕ Tạo Flashcard
                        </a>
                        <a
                            href="/import"
                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
                        >
                            📥 Import
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">📚 Học Flashcard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Card */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <FlashcardCard
                            word={currentCard.word}
                            meaning={currentCard.meaning}
                            pronunciation={currentCard.pronunciation}
                            example="Example sentence here"
                            isFavorite={favorites.includes(currentCard.id)}
                            isFlipped={isFlipped}
                            onFlip={() => setIsFlipped(!isFlipped)}
                            onFavorite={handleToggleFavorite}
                            onPlaySound={() => console.log('Play sound for', currentCard.word)}
                        />

                        {/* Controls */}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handlePrev}
                                className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                            >
                                ← Trước
                            </button>
                            <button
                                onClick={handleNext}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                            >
                                Sau →
                            </button>
                        </div>

                        {/* Progress */}
                        <div className="mt-4 text-center">
                            <p className="text-gray-600">
                                {currentIndex + 1} / {cards.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar with List */}
                <div className="lg:col-span-1">
                    <FlashcardList
                        cards={cards}
                        selectedId={currentCard.id}
                        onSelect={(id) => {
                            const index = cards.findIndex((c) => c.id === id);
                            setCurrentIndex(index);
                            dispatch(reduxSetCurrentIndex(index));
                            setIsFlipped(false);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default FlashcardStudyPage;
