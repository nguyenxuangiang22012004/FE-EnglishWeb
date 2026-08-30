'use client';

import React, { useEffect, useState } from 'react';
import { AILookupBox } from '@/components/ui/AILookupBox';
import { lookupEnglishWord, VocabularyLookupResult } from '@/services/vocabularyLookupService';
import { lookupHistoryService, AiLookupHistoryResponse } from '@/services/lookupHistoryService';
import { message } from 'antd';
import { DeckSelectModal } from '@/components/ui/DeckSelectModal';

export const AILookupPage: React.FC = () => {
    const [result, setResult] = useState<VocabularyLookupResult | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<AiLookupHistoryResponse[]>([]);
    const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);

    useEffect(() => {
        fetchRecentHistory();
    }, []);

    const fetchRecentHistory = async () => {
        try {
            const data = await lookupHistoryService.getRecentHistory();
            setRecentSearches(data);
        } catch (error) {
            console.error('Error fetching recent history:', error);
        }
    };

    const handleSearch = async (word: string) => {
        if (!word.trim()) return;
        setIsLoading(true);
        try {
            const data = await lookupEnglishWord(word);
            setResult(data);
            
            // Save to history
            await lookupHistoryService.saveHistory(data);
            
            // Refresh history
            fetchRecentHistory();
        } catch (error: any) {
            message.error(error.message || 'Lỗi khi tra cứu từ vựng.');
            setResult(undefined);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecentClick = (historyItem: AiLookupHistoryResponse) => {
        setResult({
            word: historyItem.word,
            partOfSpeech: historyItem.partOfSpeech,
            pronunciation: historyItem.pronunciation,
            meaning: historyItem.meaning,
            example: historyItem.example
        });
    };

    // Adapt VocabularyLookupResult to what AILookupBox expects
    const adaptedResult = result ? {
        word: result.word,
        meaning: result.meaning,
        pronunciation: result.pronunciation,
        wordType: result.partOfSpeech,
        examples: result.example ? [result.example] : []
    } : undefined;

    const handleAddFlashcard = () => {
        if (result) {
            setIsDeckModalOpen(true);
        }
    };

    const cardsPayload = result ? [{
        word: result.word,
        meaning: result.meaning,
        pronunciation: result.pronunciation,
        partOfSpeech: result.partOfSpeech,
        example: result.example || ''
    }] : [];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-display font-bold text-slate-100">🤖 Tra Cứu AI Từ Vựng</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <AILookupBox 
                        onSearch={handleSearch} 
                        isLoading={isLoading} 
                        result={adaptedResult} 
                        onAddFlashcard={handleAddFlashcard}
                    />
                </div>

                {/* Tips */}
                <div className="glass-card p-6 border border-accent-indigo/20 bg-gradient-to-br from-accent-indigo/5 to-transparent h-fit">
                    <h3 className="text-lg font-display font-bold text-accent-indigo-light mb-4">💡 Mẹo sử dụng</h3>
                    <ul className="space-y-2.5 text-sm text-slate-300">
                        <li className="flex items-start gap-2"><span className="text-accent-emerald mt-0.5">✦</span> Gõ từ tiếng Anh cần tra cứu</li>
                        <li className="flex items-start gap-2"><span className="text-accent-emerald mt-0.5">✦</span> AI sẽ cung cấp định nghĩa, ví dụ</li>
                        <li className="flex items-start gap-2"><span className="text-accent-emerald mt-0.5">✦</span> Nhấn &quot;Thêm vào Flashcard&quot; để lưu</li>
                        <li className="flex items-start gap-2"><span className="text-accent-emerald mt-0.5">✦</span> Từ sẽ được thêm vào collection hiện tại</li>
                    </ul>
                </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
                <div className="glass-card p-6">
                    <h3 className="text-lg font-display font-bold text-slate-200 mb-4">🕐 Tìm kiếm gần đây</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {recentSearches.map((historyItem) => (
                            <button
                                key={historyItem.id}
                                onClick={() => handleRecentClick(historyItem)}
                                className="p-3 bg-white/[0.04] border border-white/[0.06] rounded-xl hover:bg-white/[0.08] hover:border-accent-indigo/20 text-slate-300 font-medium transition-all text-sm"
                            >
                                {historyItem.word}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <DeckSelectModal
                isOpen={isDeckModalOpen}
                onClose={() => setIsDeckModalOpen(false)}
                cards={cardsPayload}
                onSuccess={() => {}}
                redirectOnSuccess={false}
            />
        </div>
    );
};

export default AILookupPage;
