'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import {
    selectSet,
    setCurrentIndex as reduxSetCurrentIndex,
} from '@/store/slices/flashcardSlice';
import { FlashcardCard } from '@/components/ui/flashcard/FlashcardCard';
import { FlashcardList } from '@/components/ui/flashcard/FlashcardList';
import { FlashcardSetList } from '@/components/ui/flashcard/FlashcardSetList';
import { useTextToSpeech } from '@/components/hooks/useTextToSpeech';

export const FlashcardStudyPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { speak } = useTextToSpeech();

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

    const handleStartQuiz = (setId: string) => {
        router.push(`/quiz?setId=${setId}`);
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

    return (
        <div className="min-h-screen bg-gray-50/50">
            {!currentSetId || !currentSet ? (
                /* === MÀN HÌNH DANH SÁCH BỘ === */
                <div className="max-w-6xl mx-auto space-y-6 p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-4xl font-bold text-gray-800">📚 Học Flashcard</h1>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-2 transition shadow-md"
                        >
                            ➕ Tạo bộ mới
                        </button>
                    </div>
                    <p className="text-gray-500">Chọn một bộ flashcard để bắt đầu học:</p>
                    <FlashcardSetList
                        sets={sets}
                        onSelect={handleSelectSet}
                        onQuiz={handleStartQuiz}
                    />
                </div>
            ) : (
                /* === MÀN HÌNH HỌC FLASHCARD (GIAO DIỆN MỚI) === */
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
                                {currentSet.emoji} {currentSet.name}
                            </h1>
                        </div>

                        <button
                            onClick={() => handleStartQuiz(currentSetId)}
                            disabled={cards.length < 4}
                            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-40 shadow-sm"
                        >
                            🎯 Làm Quiz
                        </button>
                    </div>

                    {cards.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
                            <p className="text-gray-500 text-lg">Bộ này hiện đang trống.</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {/* KHU VỰC THẺ CHÍNH - CĂN GIỮA */}
                            <div className="flex flex-col items-center">
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
                                            {currentIndex + 1} / {cards.length}
                                        </div>
                                        <button
                                            onClick={handleNext}
                                            className="flex-1 py-3 bg-gray-800 text-white rounded-2xl hover:bg-gray-900 font-semibold shadow-md transition"
                                        >
                                            Tiếp →
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-200" />

                            {/* DANH SÁCH TỪ VỰNG XUỐNG DƯỚI */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-2">
                                    <h2 className="text-xl font-bold text-gray-800">Danh sách từ vựng</h2>
                                    <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md text-xs font-bold">
                                        {cards.length}
                                    </span>
                                </div>
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

            {/* Modal - Giữ nguyên logic cũ */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-800">Tạo bộ mới</h2>
                            <p className="text-gray-500">Chọn phương thức bạn muốn bắt đầu</p>
                        </div>
                        <div className="p-4 grid gap-2">
                            {[
                                { title: 'Tạo thủ công', desc: 'Nhập tay từng từ', icon: '✍️', path: '/create' },
                                { title: 'Tạo bằng AI', desc: 'Tự động sinh từ theo chủ đề', icon: '🤖', path: '/import' },
                                { title: 'Import từ Excel', desc: 'Tải file .xlsx', icon: '📊', path: '/create/excel' },
                                { title: 'Import từ Word', desc: 'Tải file .docx', icon: '📄', path: '/create/docs' },
                            ].map((opt) => (
                                <button
                                    key={opt.path}
                                    onClick={() => { setShowCreateModal(false); router.push(opt.path); }}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 rounded-2xl text-left transition group"
                                >
                                    <div className="text-3xl bg-gray-100 group-hover:bg-white w-14 h-14 flex items-center justify-center rounded-xl transition">{opt.icon}</div>
                                    <div>
                                        <div className="font-bold text-gray-800">{opt.title}</div>
                                        <div className="text-sm text-gray-500">{opt.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="p-4 bg-gray-50 border-t">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="w-full py-3 text-gray-500 font-semibold hover:text-gray-700 transition"
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