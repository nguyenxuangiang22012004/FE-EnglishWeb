'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectSet, setCurrentIndex as reduxSetCurrentIndex, FlashcardSet } from '@/store/slices/flashcardSlice';
import { FlashcardCard } from '@/components/ui/flashcard/FlashcardCard';
import { FlashcardList, FilterStatus } from '@/components/ui/flashcard/FlashcardList';
import { useTextToSpeech } from '@/components/hooks/useTextToSpeech';

interface StudySessionClientProps {
    initialSet: FlashcardSet;
}

export const StudySessionClient: React.FC<StudySessionClientProps> = ({ initialSet }) => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { speak } = useTextToSpeech();

    // Since we are hydrating the client with the server-rendered initialSet, 
    // we want to sync the Redux state so the rest of the app knows what we're studying
    // but the source of truth for the *current* set is the initialSet prop if we are not modifying it.
    useEffect(() => {
        dispatch(selectSet(initialSet.id));
        return () => {
            dispatch(selectSet(null));
        };
    }, [dispatch, initialSet.id]);

    const reduxCurrentIndex = useAppSelector((state) => state.flashcard.currentIndex);

    const [isFlipped, setIsFlipped] = useState(false);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(reduxCurrentIndex || 0);
    const [filter, setFilter] = useState<FilterStatus>('all');

    // Keep local state in sync if redux state changes (e.g. from the list click)
    useEffect(() => {
        setCurrentIndex(reduxCurrentIndex);
    }, [reduxCurrentIndex]);


    const baseCards = initialSet.cards ?? [];
    const displayCards = filter === 'all' 
        ? baseCards 
        : baseCards.filter(c => (c.status ?? 'unknown') === filter);
        
    // Reset index safely if filtered out
    const safeIndex = displayCards.length > 0 && currentIndex < displayCards.length ? currentIndex : 0;
    const currentCard = displayCards[safeIndex];

    const handleStartQuiz = (setId: string) => {
        router.push(`/quiz?setId=${setId}&filter=${filter}`);
    };

    const handleBackToSets = () => {
        router.push('/flashcards');
    };

    const handleNext = () => {
        if (displayCards.length === 0) return;
        const newIndex = (safeIndex + 1) % displayCards.length;
        setCurrentIndex(newIndex);
        dispatch(reduxSetCurrentIndex(newIndex));
        setIsFlipped(false);
    };

    const handlePrev = () => {
        if (displayCards.length === 0) return;
        const newIndex = (safeIndex - 1 + displayCards.length) % displayCards.length;
        setCurrentIndex(newIndex);
        dispatch(reduxSetCurrentIndex(newIndex));
        setIsFlipped(false);
    };

    const handleToggleFavorite = () => {
        if (!currentCard) return;
        setFavorites((prev) =>
            prev.includes(currentCard.id)
                ? prev.filter((id) => id !== currentCard.id)
                : [...prev, currentCard.id]
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">
            {/* Header học tập */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBackToSets}
                        className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium text-sm"
                    >
                        ← Thoát
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {initialSet.emoji} {initialSet.name}
                    </h1>
                </div>

                <button
                    onClick={() => handleStartQuiz(initialSet.id)}
                    disabled={baseCards.length < 4 || displayCards.length === 0}
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-40 shadow-sm"
                >
                    🎯 Làm Quiz {filter !== 'all' && `(${displayCards.length})`}
                </button>
            </div>

            {baseCards.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
                    <p className="text-gray-500 text-lg">Bộ này hiện đang trống.</p>
                </div>
            ) : (
                <div className="space-y-10">
                    {/* KHU VỰC THẺ CHÍNH - CĂN GIỮA */}
                    <div className="flex flex-col items-center">
                        {currentCard ? (
                            <div className="w-full max-w-md">
                                <FlashcardCard
                                    word={currentCard.word}
                                    meaning={currentCard.meaning}
                                    pronunciation={currentCard.pronunciation}
                                    example={currentCard.example ?? 'Chưa có ví dụ cho từ này'}
                                    isFlipped={isFlipped}
                                    onFlip={() => setIsFlipped(!isFlipped)}
                                    onPlaySound={() => speak(currentCard.word)}
                                />

                                {/* Nút điều hướng ngay dưới thẻ */}
                                <div className="flex items-center gap-4 mt-8">
                                    <button
                                        onClick={handlePrev}
                                        className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 font-semibold shadow-sm transition"
                                    >
                                        ← Trước
                                    </button>
                                    <div className="px-4 font-medium text-gray-500">
                                        {displayCards.length > 0 ? safeIndex + 1 : 0} / {displayCards.length}
                                    </div>
                                    <button
                                        onClick={handleNext}
                                        className="flex-1 py-3 bg-gray-800 text-white rounded-2xl hover:bg-gray-900 font-semibold shadow-md transition"
                                    >
                                        Tiếp →
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full max-w-md bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400">
                                Không có từ vựng nào ở trạng thái này
                            </div>
                        )}
                    </div>

                    <hr className="border-gray-200" />

                    {/* DANH SÁCH TỪ VỰNG XUỐNG DƯỚI */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <h2 className="text-xl font-bold text-gray-800">Danh sách từ vựng</h2>
                            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md text-xs font-bold">
                                {baseCards.length}
                            </span>
                        </div>
                        <FlashcardList
                            cards={baseCards}
                            selectedId={currentCard?.id}
                            onSelect={(id) => {
                                const index = displayCards.findIndex((c) => c.id === id);
                                if (index !== -1) {
                                    setCurrentIndex(index);
                                    dispatch(reduxSetCurrentIndex(index));
                                    setIsFlipped(false);
                                }
                            }}
                            onFilterChange={(newFilter) => {
                                setFilter(newFilter);
                                setCurrentIndex(0); // Reset index on filter change
                                dispatch(reduxSetCurrentIndex(0));
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudySessionClient;
