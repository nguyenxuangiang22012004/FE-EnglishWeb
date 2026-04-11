'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import {
    selectSet,
    setCurrentIndex as reduxSetCurrentIndex,
} from '@/store/slices/flashcardSlice';
import { FlashcardCard } from '@/components/ui/FlashcardCard';
import { FlashcardList } from '@/components/ui/FlashcardList';
import { FlashcardSetList } from '@/components/ui/FlashcardSetList';

export const FlashcardStudyPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const sets = useAppSelector((state) => state.flashcard.sets);
    const currentSetId = useAppSelector((state) => state.flashcard.currentSetId);
    const reduxCurrentIndex = useAppSelector((state) => state.flashcard.currentIndex);

    const [isFlipped, setIsFlipped] = useState(false);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(reduxCurrentIndex);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const currentSet = sets.find((s) => s.id === currentSetId);
    const cards = currentSet?.cards ?? [];
    const currentCard = cards[currentIndex];

    const handleSelectSet = (setId: string) => {
        dispatch(selectSet(setId));
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const handleBackToSets = () => {
        dispatch(selectSet(null));
        setCurrentIndex(0);
        setIsFlipped(false);
    };

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
        if (!currentCard) return;
        setFavorites((prev) =>
            prev.includes(currentCard.id)
                ? prev.filter((id) => id !== currentCard.id)
                : [...prev, currentCard.id]
        );
    };

    // ====================== MAIN RETURN ======================
    return (
        <div className="min-h-screen">
            {/* === MÀN HÌNH DANH SÁCH BỘ === */}
            {!currentSetId || !currentSet ? (
                <div className="space-y-6 p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-4xl font-bold text-gray-800">📚 Học Flashcard</h1>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-2 transition"
                        >
                            ➕ Tạo bộ mới
                        </button>
                    </div>

                    <p className="text-gray-500">Chọn một bộ flashcard để bắt đầu học:</p>

                    <FlashcardSetList sets={sets} onSelect={handleSelectSet} />
                </div>
            ) : (
                /* === MÀN HÌNH HỌC FLASHCARD === */
                <div className="space-y-6 p-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBackToSets}
                            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium text-sm"
                        >
                            ← Danh sách bộ
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800">
                            {currentSet.emoji} {currentSet.name}
                        </h1>
                    </div>

                    {cards.length === 0 ? (
                        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-8 text-center">
                            <p className="text-yellow-800 text-lg">Bộ này chưa có từ nào. Hãy thêm từ vào!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <FlashcardCard
                                        word={currentCard.word}
                                        meaning={currentCard.meaning}
                                        pronunciation={currentCard.pronunciation}
                                        example={currentCard.example ?? 'Example sentence here'}
                                        isFavorite={favorites.includes(currentCard.id)}
                                        isFlipped={isFlipped}
                                        onFlip={() => setIsFlipped(!isFlipped)}
                                        onFavorite={handleToggleFavorite}
                                        onPlaySound={() => console.log('Play sound for', currentCard.word)}
                                    />

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

                                    <div className="mt-4 text-center">
                                        <p className="text-gray-600">
                                            {currentIndex + 1} / {cards.length}
                                        </p>
                                    </div>
                                </div>
                            </div>

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
                    )}
                </div>
            )}

            {/* ====================== MODAL ====================== */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
                        <div className="px-6 py-5 border-b">
                            <h2 className="text-2xl font-bold">Tạo bộ flashcard mới</h2>
                            <p className="text-gray-500 mt-1">Chọn cách tạo bộ bạn muốn</p>
                        </div>

                        <div className="p-4 space-y-2">
                            <button
                                onClick={() => { setShowCreateModal(false); router.push('/create'); }}
                                className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 rounded-2xl text-left transition"
                            >
                                <div className="text-4xl">✍️</div>
                                <div>
                                    <div className="font-semibold text-lg">Tạo thủ công</div>
                                    <div className="text-sm text-gray-500">Thêm từ vựng từng cái</div>
                                </div>
                            </button>

                            <button
                                onClick={() => { setShowCreateModal(false); router.push('/import'); }}
                                className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 rounded-2xl text-left transition"
                            >
                                <div className="text-4xl">🤖</div>
                                <div>
                                    <div className="font-semibold text-lg">Tạo bằng dữ liệu từ AI</div>
                                    <div className="text-sm text-gray-500">AI tự động sinh bộ theo chủ đề</div>
                                </div>
                            </button>

                            <button
                                onClick={() => { setShowCreateModal(false); router.push('/create/excel'); }}
                                className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 rounded-2xl text-left transition"
                            >
                                <div className="text-4xl">📊</div>
                                <div>
                                    <div className="font-semibold text-lg">Import từ Excel</div>
                                    <div className="text-sm text-gray-500">Tải file .xlsx</div>
                                </div>
                            </button>

                            <button
                                onClick={() => { setShowCreateModal(false); router.push('/create/docs'); }}
                                className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 rounded-2xl text-left transition"
                            >
                                <div className="text-4xl">📄</div>
                                <div>
                                    <div className="font-semibold text-lg">Import từ Word/Docs</div>
                                    <div className="text-sm text-gray-500">Tải file .docx</div>
                                </div>
                            </button>
                        </div>

                        <div className="p-4 border-t bg-gray-50">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="w-full py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlashcardStudyPage;