'use client';

import React, { useEffect, useState } from 'react';
import flashcardService, { FlashcardSetResponse } from '@/services/flashcardService';
import { FlashcardSetList } from '@/components/ui/flashcard/FlashcardSetList';
import { FlashcardList } from '@/components/ui/flashcard/FlashcardList';
import { CreateSetModalCoordinator } from '@/components/ui/flashcard/CreateSetModalCoordinator';
import { FlashcardSet } from '@/store/slices/flashcardSlice';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';

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
    const router = useRouter();
    const [sets, setSets] = useState<FlashcardSet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingSet, setEditingSet] = useState<FlashcardSet | null>(null);
    const [viewingSet, setViewingSet] = useState<FlashcardSet | null>(null);

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
            {viewingSet ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button 
                                icon={<ArrowLeftOutlined />} 
                                onClick={() => setViewingSet(null)}
                                className="bg-white/5 border-white/10 text-slate-300 hover:text-white"
                            >
                                Quay lại
                            </Button>
                            <div>
                                <h1 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2">
                                    <span>{viewingSet.emoji || '📚'}</span>
                                    {viewingSet.name}
                                </h1>
                                <p className="text-slate-400 text-sm">{viewingSet.description || 'Chi tiết danh sách từ vựng'}</p>
                            </div>
                        </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => router.push(`/create?setId=${viewingSet.id}`)}
                            className="bg-indigo-600 hover:bg-indigo-700 h-10 px-6 rounded-xl font-semibold border-none shadow-lg shadow-indigo-600/20"
                        >
                            Thêm từ vựng
                        </Button>
                    </div>

                    <FlashcardList 
                        cards={viewingSet.cards.length > 0 ? viewingSet.cards : [
                            { id: 'mock-1', word: 'Example', meaning: 'Ví dụ', pronunciation: '/ɪɡˈzæmpl/', status: 'mastered', example: 'This is an example flashcard.' },
                            { id: 'mock-2', word: 'Flashcard', meaning: 'Thẻ ghi nhớ', pronunciation: '/ˈflæʃkɑːrd/', status: 'learning', example: 'Flashcards are great for learning.' },
                            { id: 'mock-3', word: 'Study', meaning: 'Học tập', pronunciation: '/ˈstʌdi/', status: 'unknown', example: 'I need to study for the exam.' },
                        ]} 
                    />
                </div>
            ) : (
                <>
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
                            onViewDetails={setViewingSet}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default FlashcardsClientPage;
