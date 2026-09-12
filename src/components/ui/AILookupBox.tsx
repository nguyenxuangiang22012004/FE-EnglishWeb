'use client';

import React, { useState, useRef } from 'react';
import {
    Search,
    X,
    CornerDownLeft,
    Volume2,
    Plus,
    Loader2,
    Sparkles,
    BookOpen,
    Layers,
    Tag,
    Quote
} from 'lucide-react';
import { VocabularyLookupResult } from '@/services/vocabularyLookupService';
import { FreeDictSuggestion, formatPos } from '@/services/freeDictionaryService';

interface AILookupBoxProps {
    onSearchWord: (word: string) => void;
    onFetchSuggestions: (query: string) => Promise<FreeDictSuggestion[]>;
    isLoadingDetails?: boolean;
    result?: VocabularyLookupResult;
    onAddFlashcard?: () => void;
    onClearResult?: () => void;
}

export const AILookupBox: React.FC<AILookupBoxProps> = ({
    onSearchWord,
    onFetchSuggestions,
    isLoadingDetails = false,
    result,
    onAddFlashcard,
    onClearResult
}) => {
    const [searchWord, setSearchWord] = useState('');
    const [suggestions, setSuggestions] = useState<FreeDictSuggestion[]>([]);
    const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [activeEntryTab, setActiveEntryTab] = useState<number>(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Typing with automatic autocomplete (No button required)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchWord(val);
        setSelectedIndex(-1);
        setActiveEntryTab(0);
        onClearResult?.();

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
                const matches = await onFetchSuggestions(val);
                setSuggestions(matches);
            } catch (err) {
                console.error('Suggestions error:', err);
            } finally {
                setIsSearchingSuggestions(false);
            }
        }, 120);
    };

    const handleSelectWord = (word: string) => {
        const target = word.trim();
        if (!target) return;
        setSearchWord(target);
        setSuggestions([]);
        setActiveEntryTab(0);
        onSearchWord(target);
    };

    const handleClear = () => {
        setSearchWord('');
        setSuggestions([]);
        setSelectedIndex(-1);
        onClearResult?.();
        inputRef.current?.focus();
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
                    handleSelectWord(suggestions[selectedIndex].word);
                } else if (searchWord.trim()) {
                    handleSelectWord(searchWord.trim());
                }
            }
        } else if (e.key === 'Enter' && searchWord.trim()) {
            e.preventDefault();
            handleSelectWord(searchWord.trim());
        }
    };

    // Audio Playback
    const playAudio = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    const activeEntry = result?.entries && result.entries.length > activeEntryTab
        ? result.entries[activeEntryTab]
        : result?.entries?.[0];

    return (
        <div className="space-y-4">
            {/* Search Input Box */}
            <div className="glass-card p-4 sm:p-5 border border-accent-indigo/20 bg-surface-800/80">
                <div className="relative flex items-center bg-surface-900 border border-accent-indigo/30 rounded-2xl px-4 py-3.5 focus-within:border-accent-indigo focus-within:ring-2 focus-within:ring-accent-indigo/20 transition-all">
                    <Search className="w-5 h-5 text-accent-indigo-light mr-3 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchWord}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Tra bất kỳ từ nào (ví dụ: hello, learn, discover...)"
                        className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-base focus:outline-none"
                    />
                    {isSearchingSuggestions && (
                        <Loader2 className="w-4 h-4 text-accent-indigo-light animate-spin mr-2" />
                    )}
                    {searchWord && (
                        <button
                            onClick={handleClear}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[250px]">
                {/* 1. Loading state */}
                {isLoadingDetails && (
                    <div className="glass-card p-12 flex flex-col items-center justify-center gap-3 border border-accent-indigo/20">
                        <Loader2 className="w-9 h-9 text-accent-indigo-light animate-spin" />
                        <p className="text-sm text-accent-indigo-light font-medium">Đang tra cứu từ điển quốc tế...</p>
                    </div>
                )}

                {/* 2. Detailed Result View */}
                {!isLoadingDetails && result && (
                    <div className="glass-card p-6 border border-accent-indigo/30 bg-surface-800/90 space-y-5 animate-fadeIn">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h2 className="text-3xl font-display font-bold text-accent-indigo-light">
                                        {result.word}
                                    </h2>
                                    <button
                                        onClick={() => playAudio(result.word)}
                                        className="p-2 rounded-xl bg-accent-indigo/20 hover:bg-accent-indigo/30 text-accent-indigo-light transition-colors shadow-sm"
                                        title="Nghe phát âm chuẩn"
                                    >
                                        <Volume2 className="w-4 h-4" />
                                    </button>
                                    {result.partOfSpeech && (
                                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-indigo/20 text-accent-indigo-light border border-accent-indigo/30">
                                            {formatPos(result.partOfSpeech)}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 flex-wrap text-sm">
                                    <span className="text-slate-400 font-mono">
                                        {result.pronunciation}
                                    </span>
                                    {result.pronunciationsList && result.pronunciationsList.length > 1 && (
                                        <div className="flex gap-1.5 flex-wrap">
                                            {result.pronunciationsList.slice(1, 3).map((p, idx) => (
                                                <span key={idx} className="text-xs text-slate-400 font-mono bg-white/[0.04] px-2 py-0.5 rounded">
                                                    {p.text} {p.tags?.[0] ? `(${p.tags[0]})` : ''}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={onAddFlashcard}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-indigo to-accent-emerald hover:from-accent-indigo/90 hover:to-accent-emerald/90 text-white font-semibold text-xs shadow-lg shadow-accent-indigo/20 transition-all hover:scale-[1.02] flex-shrink-0"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm vào Flashcard
                            </button>
                        </div>

                        {/* Vietnamese Meaning */}
                        <div>
                            <p className="text-xs text-accent-indigo-light font-bold uppercase tracking-wider mb-1">
                                Nghĩa Tiếng Việt
                            </p>
                            <p className="text-slate-100 text-xl font-bold">
                                {result.meaning}
                            </p>
                        </div>

                        {/* Part of Speech Tabs */}
                        {result.entries && result.entries.length > 1 && (
                            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 overflow-x-auto">
                                <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
                                    <Layers className="w-3.5 h-3.5" /> Phân loại:
                                </span>
                                {result.entries.map((entry, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveEntryTab(idx)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${
                                            activeEntryTab === idx
                                                ? 'bg-gradient-to-r from-accent-indigo to-accent-emerald text-white shadow-md'
                                                : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                                        }`}
                                    >
                                        {entry.partOfSpeech}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Forms / Word Inflections */}
                        {activeEntry?.forms && activeEntry.forms.length > 0 && (
                            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2 flex-wrap text-xs">
                                <span className="text-accent-indigo-light font-semibold flex items-center gap-1">
                                    <Tag className="w-3.5 h-3.5" /> Các biến thể:
                                </span>
                                {activeEntry.forms.slice(0, 5).map((f, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 font-mono">
                                        <strong className="text-accent-indigo-light">{f.word}</strong>
                                        {f.tags?.[0] ? ` (${f.tags[0]})` : ''}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Senses & Definitions */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-accent-indigo-light flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4" /> Các tầng nghĩa & Định nghĩa chi tiết ({activeEntry?.senses?.length || 0})
                            </h4>

                            {activeEntry?.senses && activeEntry.senses.length > 0 ? (
                                <div className="space-y-3">
                                    {activeEntry.senses.slice(0, 6).map((sense, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 hover:border-accent-indigo/30 transition-all"
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-indigo/20 text-accent-indigo-light text-xs font-bold flex items-center justify-center mt-0.5">
                                                    {idx + 1}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="text-slate-100 text-sm leading-relaxed">
                                                        {sense.definition}
                                                    </p>
                                                    {sense.tags && sense.tags.length > 0 && (
                                                        <div className="flex gap-1.5 mt-1.5">
                                                            {sense.tags.map((t, i) => (
                                                                <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-accent-emerald/20 text-accent-emerald-light border border-accent-emerald/30">
                                                                    {t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {sense.examples && sense.examples.length > 0 && (
                                                <div className="mt-2 pl-7 space-y-1.5">
                                                    {sense.examples.slice(0, 2).map((ex, i) => (
                                                        <div key={i} className="p-2.5 rounded-xl bg-black/25 border border-white/5 text-slate-300 text-xs italic flex items-center justify-between">
                                                            <span>&ldquo;{ex}&rdquo;</span>
                                                            <button
                                                                onClick={() => playAudio(ex)}
                                                                className="p-1 rounded text-slate-400 hover:text-accent-indigo-light"
                                                            >
                                                                <Volume2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {sense.quotes && sense.quotes.length > 0 && (
                                                <div className="mt-2 pl-7">
                                                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 text-xs flex items-start gap-2">
                                                        <Quote className="w-3.5 h-3.5 text-accent-indigo-light flex-shrink-0 mt-0.5" />
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

                        {/* Synonyms */}
                        {result.synonyms && result.synonyms.length > 0 && (
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-accent-indigo-light">
                                    Từ đồng nghĩa (Synonyms)
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {result.synonyms.slice(0, 15).map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSelectWord(s)}
                                            className="px-2.5 py-1 rounded-lg text-xs bg-white/[0.04] text-slate-300 hover:text-accent-indigo-light hover:bg-accent-indigo/10 cursor-pointer transition-all border border-white/[0.06]"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                onClearResult?.();
                                setSuggestions([]);
                            }}
                            className="text-xs text-accent-indigo-light hover:underline font-medium pt-2 block"
                        >
                            ← Quay lại danh sách gợi ý
                        </button>
                    </div>
                )}

                {/* 3. Suggestions List (Instant Real-time Search) */}
                {!isLoadingDetails && !result && suggestions.length > 0 && (
                    <div className="glass-card p-3 border border-accent-indigo/20 bg-surface-800/95 space-y-1 animate-fadeIn">
                        {suggestions.map((item, idx) => {
                            const isSelected = idx === selectedIndex;
                            return (
                                <div
                                    key={`${item.word}-${idx}`}
                                    onClick={() => handleSelectWord(item.word)}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all ${
                                        isSelected
                                            ? 'bg-accent-indigo/15 border border-accent-indigo/40 shadow-md'
                                            : 'hover:bg-white/[0.04] border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-baseline gap-2.5 flex-1 min-w-0 pr-4">
                                        <span className="font-bold text-base text-accent-indigo-light tracking-wide">
                                            {item.word}
                                        </span>
                                        <span className="text-slate-400 text-xs truncate">
                                            Tra cứu từ điển chi tiết
                                        </span>
                                    </div>

                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/[0.06] text-slate-300 border border-white/[0.08] flex items-center gap-1">
                                        <CornerDownLeft className="w-3 h-3 text-accent-indigo-light" /> tra từ
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 4. Instant Prompt when typing */}
                {!isLoadingDetails && !result && searchWord.trim() && suggestions.length === 0 && !isSearchingSuggestions && (
                    <div
                        onClick={() => handleSelectWord(searchWord.trim())}
                        className="glass-card p-5 border border-accent-indigo/30 bg-surface-800/90 flex items-center justify-between cursor-pointer hover:border-accent-indigo transition-all rounded-2xl animate-fadeIn"
                    >
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-accent-indigo-light" />
                            <div>
                                <p className="text-slate-200 font-medium">
                                    Tra từ &ldquo;<span className="text-accent-indigo-light font-bold">{searchWord}</span>&rdquo;
                                </p>
                                <p className="text-xs text-slate-400">
                                    Nhấn Enter để tra từ điển quốc tế
                                </p>
                            </div>
                        </div>
                        <CornerDownLeft className="w-4 h-4 text-accent-indigo-light" />
                    </div>
                )}

                {/* 5. Empty State */}
                {!isLoadingDetails && !result && !searchWord.trim() && (
                    <div className="glass-card p-12 border border-white/5 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center text-3xl mb-4">
                            📖
                        </div>
                        <h3 className="text-lg font-display font-bold text-slate-200 mb-1">
                            Tra cứu từ vựng tiếng Anh
                        </h3>
                        <p className="text-sm text-slate-400 max-w-md">
                            Gõ bất kỳ từ tiếng Anh nào vào ô tìm kiếm ở trên để xem gợi ý tức thì và giải nghĩa chi tiết từ điển.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AILookupBox;
