'use client';

import React, { useEffect, useState } from 'react';
import flashcardService, { FlashcardSetResponse } from '@/services/flashcardService';
import { FlashcardSetList } from '@/components/ui/flashcard/FlashcardSetList';
import { CreateSetModalCoordinator } from '@/components/ui/flashcard/CreateSetModalCoordinator';
import { FlashcardSet } from '@/store/slices/flashcardSlice';

// Convert API response to local FlashcardSet shape for FlashcardSetList
const toLocalSet = (apiSet: FlashcardSetResponse): FlashcardSet => ({
    id: apiSet.id,
    name: apiSet.name,
    description: apiSet.description,
    emoji: apiSet.emoji,
    createdAt: apiSet.createdAt,
    cards: (apiSet.cards || []).map(card => ({
        id: card.id,
        word: card.word,
        meaning: card.meaning,
        pronunciation: card.pronunciation,
        example: card.example,
        createdAt: card.createdAt,
        status: 'unknown' as const,
    })),
});

export const FlashcardsClientPage: React.FC = () => {
    const [sets, setSets] = useState<FlashcardSet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingSet, setEditingSet] = useState<FlashcardSet | null>(null);

    const fetchSets = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await flashcardService.getMySets();
            if (res.success) {
                setSets(res.data.map(toLocalSet));
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Không thể tải danh sách bộ từ.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSet = async (setId: string) => {
        try {
            const res = await flashcardService.deleteSet(setId);
            if (res.success) {
                setSets(prev => prev.filter(s => s.id !== setId));
            }
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Không thể xóa bộ từ.');
        }
    };

    useEffect(() => {
        fetchSets();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-display font-bold text-slate-100">📚 Học Flashcard</h1>
                <CreateSetModalCoordinator 
                    onSetCreated={fetchSets} 
                    editingSet={editingSet} 
                    onClose={() => setEditingSet(null)} 
                />
            </div>
            <p className="text-slate-400">Chọn một bộ flashcard để bắt đầu học:</p>

            {isLoading && (
                <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="ml-3 text-slate-400">Đang tải...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            {!isLoading && !error && (
                <FlashcardSetList 
                    sets={sets} 
                    onEdit={setEditingSet} 
                    onDelete={handleDeleteSet} 
                />
            )}
        </div>
    );
};

export default FlashcardsClientPage;
