'use client';

import React, { useEffect, useState } from 'react';
import { AILookupBox } from '@/components/ui/AILookupBox';
import {
    lookupEnglishWord,
    searchDictionarySuggestions,
    VocabularyLookupResult
} from '@/services/vocabularyLookupService';
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
            if (Array.isArray(data)) {
                setRecentSearches(data);
            }
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

            // Save to history backend
            try {
                await lookupHistoryService.saveHistory(data);
                fetchRecentHistory();
            } catch {
                // Ignore history save error
            }
        } catch (error: any) {
            message.error(error.message || 'Lỗi khi tra cứu từ vựng.');
            setResult(undefined);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecentClick = (historyItem: AiLookupHistoryResponse) => {
        handleSearch(historyItem.word);
    };

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-100 flex items-center gap-2.5">
                        <span>📖</span> Tra Cứu Từ Vựng Quốc Tế
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Hệ thống từ điển quốc tế FreeDictionaryAPI & Dịch nghĩa tiếng Việt thông minh
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column */}
                <div className="lg:col-span-2">
                    <AILookupBox
                        onSearchWord={handleSearch}
                        onFetchSuggestions={searchDictionarySuggestions}
                        isLoadingDetails={isLoading}
                        result={result}
                        onAddFlashcard={handleAddFlashcard}
                        onClearResult={() => setResult(undefined)}
                    />
                </div>

                {/* Sidebar Column: Recent Searches */}
                <div>
                    <div className="glass-card p-6 border border-white/5 bg-surface-800/80">
                        <h3 className="text-base font-display font-bold text-slate-200 mb-4 flex items-center justify-between">
                            <span>🕐 Tìm kiếm gần đây</span>
                            <span className="text-xs text-slate-400 font-normal">{recentSearches.length} từ</span>
                        </h3>
                        {recentSearches.length > 0 ? (
                            <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                                {recentSearches.map((historyItem) => (
                                    <button
                                        key={historyItem.id}
                                        onClick={() => handleRecentClick(historyItem)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-accent-indigo/10 hover:border-accent-indigo/30 transition-all text-left group"
                                    >
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-bold text-accent-indigo-light group-hover:text-accent-indigo">
                                                {historyItem.word}
                                            </span>
                                            {historyItem.pronunciation && (
                                                <span className="text-xs text-slate-400 font-mono">
                                                    {historyItem.pronunciation}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-400 truncate max-w-[120px]">
                                            {historyItem.meaning}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic">Chưa có lịch sử tra từ.</p>
                        )}
                    </div>
                </div>
            </div>

            <DeckSelectModal
                isOpen={isDeckModalOpen}
                onClose={() => setIsDeckModalOpen(false)}
                cards={cardsPayload}
                onSuccess={() => {
                    message.success('Đã lưu từ vựng vào bộ thẻ!');
                }}
                redirectOnSuccess={false}
            />
        </div>
    );
};

export default AILookupPage;
