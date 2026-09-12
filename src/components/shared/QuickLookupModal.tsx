'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    X,
    CornerDownLeft,
    Globe,
    Volume2,
    Plus,
    Loader2,
    Sparkles,
    BookOpen,
    Layers,
    Tag,
    Quote
} from 'lucide-react';
import {
    searchDictionarySuggestions,
    lookupEnglishWord,
    VocabularyLookupResult
} from '@/services/vocabularyLookupService';
import lookupHistoryService, { AiLookupHistoryResponse } from '@/services/lookupHistoryService';
import { FreeDictSuggestion, formatPos } from '@/services/freeDictionaryService';
import { DeckSelectModal } from '@/components/ui/DeckSelectModal';
import { message } from 'antd';

interface QuickLookupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const QuickLookupModal: React.FC<QuickLookupModalProps> = ({ isOpen, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<FreeDictSuggestion[]>([]);
    const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
    const [recentHistory, setRecentHistory] = useState<AiLookupHistoryResponse[]>([]);
    const [selectedResult, setSelectedResult] = useState<VocabularyLookupResult | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [activeEntryTab, setActiveEntryTab] = useState<number>(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch recent history and focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchHistory();
            setSelectedResult(null);
            setSelectedIndex(-1);
            setActiveEntryTab(0);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        } else {
            setSearchTerm('');
            setSuggestions([]);
            setSelectedResult(null);
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        try {
            const data = await lookupHistoryService.getRecentHistory();
            if (Array.isArray(data)) {
                setRecentHistory(data);
            }
        } catch {
            // silent fail for history
        }
    };

    // Fast search with debounce via Datamuse API (Unlimited words)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchTerm(val);
        setSelectedResult(null);
        setSelectedIndex(-1);
        setActiveEntryTab(0);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (!val.trim()) {
            setSuggestions([]);
            setIsSearchingSuggestions(false);
            return;
        }

        setIsSearchingSuggestions(true);
        debounceTimerRef.current = setTimeout(async () => {
            try {
                const matches = await searchDictionarySuggestions(val, 8);
                setSuggestions(matches);
            } catch (err) {
                console.error('Suggestion fetch error:', err);
            } finally {
                setIsSearchingSuggestions(false);
            }
        }, 120);
    };

    // Execute lookup (via FreeDictionaryAPI.com)
    const handleSelectWord = async (word: string) => {
        const targetWord = word.trim();
        if (!targetWord) return;

        setIsLoadingDetails(true);
        setActiveEntryTab(0);
        try {
            const data = await lookupEnglishWord(targetWord);
            setSelectedResult(data);

            // Save to backend history
            try {
                await lookupHistoryService.saveHistory(data);
                fetchHistory();
            } catch {
                // Ignore history save error
            }
        } catch (err: any) {
            message.warning(err.message || 'Không thể lấy thông tin chi tiết từ vựng.');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // Audio Playback via Web Speech API
    const playAudio = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            onClose();
            return;
        }

        if (suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    const item = suggestions[selectedIndex];
                    handleSelectWord(item.word);
                } else if (searchTerm.trim()) {
                    handleSelectWord(searchTerm.trim());
                }
            }
        } else if (e.key === 'Enter' && searchTerm.trim()) {
            e.preventDefault();
            handleSelectWord(searchTerm.trim());
        }
    };

    if (!isOpen) return null;

    const cardsForDeck = selectedResult ? [{
        word: selectedResult.word,
        meaning: selectedResult.meaning,
        pronunciation: selectedResult.pronunciation,
        partOfSpeech: selectedResult.partOfSpeech,
        example: selectedResult.example || ''
    }] : [];

    const activeEntry = selectedResult?.entries && selectedResult.entries.length > activeEntryTab
        ? selectedResult.entries[activeEntryTab]
        : selectedResult?.entries?.[0];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity" />

            {/* Modal Box */}
            <div
                className="relative w-full max-w-3xl bg-[#0a0f1d] border border-blue-500/30 rounded-3xl shadow-[0_0_60px_rgba(30,58,138,0.35)] overflow-hidden animate-fadeInScale flex flex-col max-h-[88vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input Bar */}
                <div className="p-4 sm:p-5 border-b border-blue-500/20">
                    <div className="relative flex items-center bg-[#11192e] border border-blue-500/40 rounded-2xl px-4 py-3 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
                        <Search className="w-5 h-5 text-cyan-400/80 mr-3 flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Tra bất kỳ từ nào..."
                            className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-base focus:outline-none"
                        />
                        {isSearchingSuggestions && (
                            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin mr-2" />
                        )}
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSuggestions([]);
                                    setSelectedResult(null);
                                    inputRef.current?.focus();
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Body */}
                <div
                    ref={listRef}
                    className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-[240px] custom-scrollbar"
                >
                    {/* 1. Loading Details */}
                    {isLoadingDetails && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2 className="w-9 h-9 text-cyan-400 animate-spin" />
                            <p className="text-sm text-cyan-300 font-medium">Đang tra cứu từ điển quốc tế...</p>
                        </div>
                    )}

                    {/* 2. Comprehensive Details View (FreeDictionaryAPI.com) */}
                    {!isLoadingDetails && selectedResult && (
                        <div className="space-y-5 animate-fadeIn">
                            {/* Header Section */}
                            <div className="p-5 rounded-2xl bg-[#11192e]/90 border border-blue-500/30">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className="text-3xl font-display font-bold text-cyan-400">
                                                {selectedResult.word}
                                            </h3>
                                            <button
                                                onClick={() => playAudio(selectedResult.word)}
                                                className="p-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-cyan-300 transition-colors shadow-sm"
                                                title="Nghe phát âm chuẩn"
                                            >
                                                <Volume2 className="w-4 h-4" />
                                            </button>
                                            {selectedResult.partOfSpeech && (
                                                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                                                    {formatPos(selectedResult.partOfSpeech)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Pronunciations list */}
                                        <div className="flex items-center gap-2 flex-wrap text-sm">
                                            <span className="text-slate-400 font-mono">
                                                {selectedResult.pronunciation}
                                            </span>
                                            {selectedResult.pronunciationsList && selectedResult.pronunciationsList.length > 1 && (
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {selectedResult.pronunciationsList.slice(1, 3).map((p, idx) => (
                                                        <span key={idx} className="text-xs text-slate-400 font-mono bg-white/[0.04] px-2 py-0.5 rounded">
                                                            {p.text} {p.tags?.[0] ? `(${p.tags[0]})` : ''}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsDeckModalOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] flex-shrink-0"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Lưu Flashcard
                                    </button>
                                </div>

                                {/* Vietnamese Translation */}
                                <div className="mt-4 pt-3 border-t border-blue-500/15">
                                    <p className="text-[11px] text-cyan-300/80 font-bold uppercase tracking-wider mb-0.5">
                                        Nghĩa Tiếng Việt
                                    </p>
                                    <p className="text-slate-100 text-xl font-bold">
                                        {selectedResult.meaning}
                                    </p>
                                </div>
                            </div>

                            {/* Part of Speech Entry Tabs */}
                            {selectedResult.entries && selectedResult.entries.length > 1 && (
                                <div className="flex items-center gap-2 border-b border-blue-500/20 pb-2 overflow-x-auto">
                                    <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
                                        <Layers className="w-3.5 h-3.5" /> Phân loại:
                                    </span>
                                    {selectedResult.entries.map((entry, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveEntryTab(idx)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${
                                                activeEntryTab === idx
                                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                                                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                                            }`}
                                        >
                                            {entry.partOfSpeech}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Forms / Word inflections */}
                            {activeEntry?.forms && activeEntry.forms.length > 0 && (
                                <div className="p-3.5 rounded-xl bg-[#11192e]/60 border border-white/5 flex items-center gap-2 flex-wrap text-xs">
                                    <span className="text-cyan-300 font-semibold flex items-center gap-1">
                                        <Tag className="w-3.5 h-3.5" /> Các biến thể:
                                    </span>
                                    {activeEntry.forms.slice(0, 5).map((f, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 font-mono">
                                            <strong className="text-cyan-400">{f.word}</strong>
                                            {f.tags?.[0] ? ` (${f.tags[0]})` : ''}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Senses & Definitions List */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                                    <BookOpen className="w-4 h-4" /> Các tầng nghĩa & Định nghĩa chi tiết ({activeEntry?.senses?.length || 0})
                                </h4>

                                {activeEntry?.senses && activeEntry.senses.length > 0 ? (
                                    <div className="space-y-3">
                                        {activeEntry.senses.slice(0, 6).map((sense, idx) => (
                                            <div
                                                key={idx}
                                                className="p-4 rounded-2xl bg-[#0d1527] border border-blue-500/20 space-y-2 hover:border-cyan-500/40 transition-all"
                                            >
                                                {/* Definition */}
                                                <div className="flex items-start gap-2.5">
                                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center mt-0.5">
                                                        {idx + 1}
                                                    </span>
                                                    <div className="flex-1">
                                                        <p className="text-slate-100 text-sm leading-relaxed">
                                                            {sense.definition}
                                                        </p>
                                                        {sense.tags && sense.tags.length > 0 && (
                                                            <div className="flex gap-1.5 mt-1.5">
                                                                {sense.tags.map((t, i) => (
                                                                    <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                                                                        {t}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Examples */}
                                                {sense.examples && sense.examples.length > 0 && (
                                                    <div className="mt-2 pl-7 space-y-1.5">
                                                        {sense.examples.slice(0, 2).map((ex, i) => (
                                                            <div key={i} className="p-2.5 rounded-xl bg-black/25 border border-white/5 text-slate-300 text-xs italic flex items-center justify-between">
                                                                <span>&ldquo;{ex}&rdquo;</span>
                                                                <button
                                                                    onClick={() => playAudio(ex)}
                                                                    className="p-1 rounded text-slate-400 hover:text-cyan-300"
                                                                >
                                                                    <Volume2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Quotes if any */}
                                                {sense.quotes && sense.quotes.length > 0 && (
                                                    <div className="mt-2 pl-7">
                                                        <div className="p-2 rounded-xl bg-blue-950/30 border border-blue-500/20 text-slate-400 text-xs flex items-start gap-2">
                                                            <Quote className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                                                            <div>
                                                                <p className="italic">&ldquo;{sense.quotes[0].text}&rdquo;</p>
                                                                {sense.quotes[0].reference && (
                                                                    <p className="text-[10px] text-slate-400 mt-0.5">— {sense.quotes[0].reference}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">Không có định nghĩa mở rộng.</p>
                                )}
                            </div>

                            {/* Synonyms & Antonyms */}
                            {selectedResult.synonyms && selectedResult.synonyms.length > 0 && (
                                <div className="p-4 rounded-2xl bg-[#11192e]/60 border border-blue-500/20 space-y-2">
                                    <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                                        Từ đồng nghĩa (Synonyms)
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedResult.synonyms.slice(0, 15).map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSelectWord(s)}
                                                className="px-2.5 py-1 rounded-lg text-xs bg-white/[0.04] text-slate-300 hover:text-cyan-300 hover:bg-blue-500/20 cursor-pointer transition-all border border-white/[0.06]"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setSelectedResult(null)}
                                className="text-xs text-cyan-400 hover:underline pt-2 block font-medium"
                            >
                                ← Quay lại danh sách gợi ý
                            </button>
                        </div>
                    )}

                    {/* 3. Search Suggestions List from Datamuse API (Unlimited Words) */}
                    {!isLoadingDetails && !selectedResult && suggestions.length > 0 && (
                        <div className="space-y-1">
                            {suggestions.map((item, idx) => {
                                const isSelected = idx === selectedIndex;
                                return (
                                    <div
                                        key={`${item.word}-${idx}`}
                                        onClick={() => handleSelectWord(item.word)}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                        className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all ${
                                            isSelected
                                                ? 'bg-[#16223b] border border-cyan-500/40 shadow-md'
                                                : 'hover:bg-[#11192e] border border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-baseline gap-2.5 flex-1 min-w-0 pr-4">
                                            <span className="font-bold text-base text-cyan-400 tracking-wide">
                                                {item.word}
                                            </span>
                                            <span className="text-slate-400 text-xs truncate">
                                                Tra cứu từ điển chi tiết
                                            </span>
                                        </div>

                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/[0.06] text-slate-300 border border-white/[0.08] flex items-center gap-1">
                                            <CornerDownLeft className="w-3 h-3 text-cyan-400" /> tra từ
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* 4. Instant Prompt when word is typed */}
                    {!isLoadingDetails && !selectedResult && searchTerm.trim() && suggestions.length === 0 && !isSearchingSuggestions && (
                        <div
                            onClick={() => handleSelectWord(searchTerm.trim())}
                            className="flex items-center justify-between p-4 rounded-2xl bg-[#11192e] border border-blue-500/30 hover:border-cyan-400 cursor-pointer transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-cyan-400" />
                                <div>
                                    <p className="text-slate-200 font-medium">
                                        Tra từ &ldquo;<span className="text-cyan-400 font-bold">{searchTerm}</span>&rdquo;
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Nhấn Enter để tra từ điển quốc tế
                                    </p>
                                </div>
                            </div>
                            <CornerDownLeft className="w-4 h-4 text-cyan-400" />
                        </div>
                    )}

                    {/* 5. Empty State / Recent History */}
                    {!isLoadingDetails && !selectedResult && !searchTerm.trim() && (
                        <div>
                            {recentHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <p className="text-slate-400 text-sm font-medium">
                                        Các từ bạn vừa tra sẽ hiện ở đây.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-2">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Tìm kiếm gần đây
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        {recentHistory.slice(0, 6).map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => {
                                                    setSelectedResult(item);
                                                }}
                                                className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#11192e] border border-transparent hover:border-blue-500/20 cursor-pointer transition-all"
                                            >
                                                <div className="flex items-baseline gap-2.5">
                                                    <span className="font-bold text-cyan-400 text-sm">
                                                        {item.word}
                                                    </span>
                                                    {item.pronunciation && (
                                                        <span className="text-slate-400 text-xs font-mono">
                                                            {item.pronunciation}
                                                        </span>
                                                    )}
                                                    <span className="text-slate-300 text-xs truncate max-w-xs">
                                                        {item.meaning}
                                                    </span>
                                                </div>
                                                {item.partOfSpeech && (
                                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/[0.05] text-slate-400">
                                                        {item.partOfSpeech}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Bar */}
                <div className="px-5 py-3.5 bg-[#0b101f] border-t border-blue-500/20 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <kbd className="px-2 py-0.5 rounded-md bg-white/[0.08] text-slate-300 font-mono text-[11px] border border-white/[0.1]">
                                ↵
                            </kbd>{' '}
                            tra nghĩa
                        </span>
                        <span className="flex items-center gap-1.5">
                            <kbd className="px-2 py-0.5 rounded-md bg-white/[0.08] text-slate-300 font-mono text-[11px] border border-white/[0.1]">
                                esc
                            </kbd>{' '}
                            đóng
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400/90 font-medium">
                        <Globe className="w-3.5 h-3.5 text-cyan-400/80" />
                        <span>Hoạt động ở mọi trang</span>
                    </div>
                </div>
            </div>

            {/* Flashcard Save Modal */}
            <DeckSelectModal
                isOpen={isDeckModalOpen}
                onClose={() => setIsDeckModalOpen(false)}
                cards={cardsForDeck}
                onSuccess={() => {
                    message.success('Đã lưu từ vựng vào bộ thẻ!');
                }}
                redirectOnSuccess={false}
            />
        </div>
    );
};

export default QuickLookupModal;
