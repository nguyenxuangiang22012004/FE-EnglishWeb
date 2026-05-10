'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectSet, setCurrentIndex as reduxSetCurrentIndex, FlashcardSet } from '@/store/slices/flashcardSlice';
import { FlashcardCard } from '@/components/ui/flashcard/FlashcardCard';
import { FlashcardList, FilterStatus } from '@/components/ui/flashcard/FlashcardList';
import { useTextToSpeech } from '@/components/hooks/useTextToSpeech';
import flashcardService from '@/services/flashcardService';

interface StudySessionClientProps {
    initialSet: FlashcardSet;
}

export const StudySessionClient: React.FC<StudySessionClientProps> = ({ initialSet }) => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { speak } = useTextToSpeech();

    useEffect(() => {
        dispatch(selectSet(initialSet.id));
        return () => { dispatch(selectSet(null)); };
    }, [dispatch, initialSet.id]);

    const reduxCurrentIndex = useAppSelector((state) => state.flashcard.currentIndex);
    const [isFlipped, setIsFlipped] = useState(false);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(reduxCurrentIndex || 0);
    const [filter, setFilter] = useState<FilterStatus>('all');
    const [localCards, setLocalCards] = useState(initialSet.cards ?? []);

    useEffect(() => { setCurrentIndex(reduxCurrentIndex); }, [reduxCurrentIndex]);
    useEffect(() => { setLocalCards(initialSet.cards ?? []); }, [initialSet.cards]);

    const baseCards = localCards;
    const displayCards = filter === 'all' ? baseCards : baseCards.filter(c => (c.status ?? 'unknown') === filter);
    const safeIndex = displayCards.length > 0 && currentIndex < displayCards.length ? currentIndex : 0;
    const currentCard = displayCards[safeIndex];

    const handleStartQuiz = (setId: string) => { router.push(`/quiz?setId=${setId}&filter=${filter}`); };
    const handleBackToSets = () => { router.push('/flashcards'); };
    const handleNext = () => { if (displayCards.length === 0) return; const newIndex = (safeIndex + 1) % displayCards.length; setCurrentIndex(newIndex); dispatch(reduxSetCurrentIndex(newIndex)); setIsFlipped(false); };
    const handlePrev = () => { if (displayCards.length === 0) return; const newIndex = (safeIndex - 1 + displayCards.length) % displayCards.length; setCurrentIndex(newIndex); dispatch(reduxSetCurrentIndex(newIndex)); setIsFlipped(false); };
    const handleToggleFavorite = () => { if (!currentCard) return; setFavorites((prev) => prev.includes(currentCard.id) ? prev.filter((id) => id !== currentCard.id) : [...prev, currentCard.id]); };

    const handleStatusChange = async (cardId: string, newStatus: 'unknown' | 'learning' | 'mastered') => {
        setLocalCards(prev => prev.map(c => c.id === cardId ? { ...c, status: newStatus } : c));
        try {
            await flashcardService.updateCardProgress(cardId, newStatus.toUpperCase() as any);
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={handleBackToSets} className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-accent-indigo-light hover:bg-white/[0.04] rounded-xl transition font-medium text-sm">
                        ← Thoát
                    </button>
                    <h1 className="text-2xl font-display font-bold text-slate-100">
                        {initialSet.emoji} {initialSet.name}
                    </h1>
                </div>
                <button onClick={() => handleStartQuiz(initialSet.id)} disabled={baseCards.length < 4 || displayCards.length === 0}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-accent-indigo to-accent-indigo-light text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-40 glow-btn text-sm">
                    🎯 Làm Quiz {filter !== 'all' && `(${displayCards.length})`}
                </button>
            </div>

            {baseCards.length === 0 ? (
                <div className="glass-card border-2 border-dashed border-white/10 p-12 text-center">
                    <p className="text-slate-500 text-lg">Bộ này hiện đang trống.</p>
                </div>
            ) : (
                <div className="space-y-10">
                    <div className="flex flex-col items-center">
                        {currentCard ? (
                            <div className="w-full max-w-md">
                                <FlashcardCard 
                                    word={currentCard.word} 
                                    meaning={currentCard.meaning} 
                                    pronunciation={currentCard.pronunciation} 
                                    example={currentCard.example ?? 'Chưa có ví dụ cho từ này'} 
                                    isFlipped={isFlipped} 
                                    status={currentCard.status as 'unknown' | 'learning' | 'mastered'}
                                    onFlip={() => setIsFlipped(!isFlipped)} 
                                    onPlaySound={() => speak(currentCard.word)} 
                                    onStatusChange={(status) => handleStatusChange(currentCard.id, status)}
                                />
                                <div className="flex items-center gap-4 mt-8">
                                    <button onClick={handlePrev} className="flex-1 py-3 bg-white/[0.04] border border-white/[0.08] text-slate-300 rounded-2xl hover:bg-white/[0.08] font-semibold transition">← Trước</button>
                                    <div className="px-4 font-medium text-slate-500">{displayCards.length > 0 ? safeIndex + 1 : 0} / {displayCards.length}</div>
                                    <button onClick={handleNext} className="flex-1 py-3 bg-gradient-to-r from-accent-indigo to-accent-indigo-light text-white rounded-2xl font-semibold glow-btn">Tiếp →</button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full max-w-md glass-card border-2 border-dashed border-white/10 p-12 text-center text-slate-500">
                                Không có từ vựng nào ở trạng thái này
                            </div>
                        )}
                    </div>

                    <hr className="border-white/[0.06]" />

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <h2 className="text-xl font-display font-bold text-slate-200">Danh sách từ vựng</h2>
                            <span className="bg-white/[0.08] text-slate-400 px-2 py-0.5 rounded-lg text-xs font-bold">{baseCards.length}</span>
                        </div>
                        <FlashcardList cards={baseCards} selectedId={currentCard?.id}
                            onSelect={(id) => { const index = displayCards.findIndex((c) => c.id === id); if (index !== -1) { setCurrentIndex(index); dispatch(reduxSetCurrentIndex(index)); setIsFlipped(false); } }}
                            onFilterChange={(newFilter) => { setFilter(newFilter); setCurrentIndex(0); dispatch(reduxSetCurrentIndex(0)); }}
                            onUpdate={(id, data) => { if (data.status) handleStatusChange(id, data.status as any); }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudySessionClient;
