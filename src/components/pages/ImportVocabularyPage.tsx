'use client';

import React, { useState } from 'react';
import { useImportVocabulary } from '@/components/hooks/useImportVocabulary';
import { useAIImport } from '@/components/hooks/useAIImport';
import { DeckSelectModal } from '@/components/ui/DeckSelectModal';
import { ImportTabAITopic } from './import/ImportTabAITopic';
import { ImportTabAIImage } from './import/ImportTabAIImage';
import { AIVocabItem } from '@/services/importAIService';

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
    { id: 'topic' as const, label: '✨ Nhập chủ đề', color: 'indigo' },
    { id: 'image' as const, label: '🖼️ Upload ảnh', color: 'cyan' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const ImportVocabularyPage: React.FC = () => {
    const {
        state,
        allSelected,
        setWordsFromAI,
        toggleWordSelection,
        toggleSelectAll,
        clearAll,
        getSelectedCards,
    } = useImportVocabulary();

    const handleAISuccess = (items: AIVocabItem[]) => {
        setWordsFromAI(items);
    };

    const aiImport = useAIImport(handleAISuccess);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        const selected = state.parsedWords.filter((w) => w.selected);
        if (selected.length === 0) {
            alert('❌ Vui lòng chọn ít nhất 1 từ');
            return;
        }
        setIsModalOpen(true);
    };

    const handleImportSuccess = () => {
        clearAll();
    };

    const handleClearAll = () => {
        clearAll();
        aiImport.handleRemoveImage();
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-display font-bold text-slate-100">
                    🤖 Import từ vựng bằng AI
                </h1>
                {state.parsedWords.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="px-4 py-2 bg-accent-rose/10 border border-accent-rose/20 text-accent-rose rounded-xl hover:bg-accent-rose/20 text-sm font-medium transition-all"
                    >
                        🗑️ Clear
                    </button>
                )}
            </div>

            {/* Tab switcher */}
            <div className="flex gap-2 p-1.5 bg-surface-800 rounded-2xl border border-white/[0.06] w-fit">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        id={`import-tab-${tab.id}`}
                        onClick={() => aiImport.setActiveTab(tab.id)}
                        className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                            aiImport.state.activeTab === tab.id
                                ? tab.id === 'topic'
                                    ? 'bg-gradient-to-r from-accent-indigo to-accent-cyan text-white shadow-lg shadow-accent-indigo/20'
                                    : 'bg-gradient-to-r from-accent-cyan to-accent-emerald text-white shadow-lg shadow-accent-cyan/20'
                                : 'text-slate-400 hover:text-slate-300 hover:bg-white/[0.04]'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left – Active tab input */}
                <div>
                    {aiImport.state.activeTab === 'topic' ? (
                        <ImportTabAITopic
                            topic={aiImport.state.topic}
                            wordCount={aiImport.state.wordCount}
                            wordCountRaw={aiImport.state.wordCountRaw}
                            wordCountError={aiImport.state.wordCountError}
                            isLoading={aiImport.state.isLoading}
                            error={aiImport.state.error}
                            onTopicChange={aiImport.handleTopicChange}
                            onWordCountChange={aiImport.handleWordCountChange}
                            onGenerate={aiImport.generateFromTopic}
                            onCancel={aiImport.cancelGeneration}
                        />
                    ) : (
                        <ImportTabAIImage
                            imagePreview={aiImport.state.imagePreview}
                            wordCount={aiImport.state.wordCount}
                            wordCountRaw={aiImport.state.wordCountRaw}
                            wordCountError={aiImport.state.wordCountError}
                            isLoading={aiImport.state.isLoading}
                            error={aiImport.state.error}
                            onImageSelect={aiImport.handleImageSelect}
                            onRemoveImage={aiImport.handleRemoveImage}
                            onWordCountChange={aiImport.handleWordCountChange}
                            onGenerate={aiImport.generateFromImage}
                            onCancel={aiImport.cancelGeneration}
                        />
                    )}
                </div>

                {/* Right – Result preview */}
                <div className="space-y-4">
                    {state.parsedWords.length > 0 && (
                        <StatsCards
                            total={state.parsedWords.length}
                            selected={state.selectedCount}
                        />
                    )}

                    {state.parsedWords.length > 0 && (
                        <button
                            onClick={toggleSelectAll}
                            className={`w-full py-2.5 rounded-xl font-medium transition text-sm ${
                                allSelected
                                    ? 'bg-white/[0.06] text-slate-400 border border-white/[0.06]'
                                    : 'bg-accent-indigo/10 text-accent-indigo-light border border-accent-indigo/20'
                            }`}
                        >
                            {allSelected ? '✓ Bỏ chọn tất cả' : '□ Chọn tất cả'}
                        </button>
                    )}

                    {state.parsedWords.length > 0 && (
                        <WordList
                            words={state.parsedWords}
                            onToggle={toggleWordSelection}
                        />
                    )}

                    {state.parsedWords.length === 0 && (
                        <EmptyResultState isLoading={aiImport.state.isLoading} />
                    )}
                </div>
            </div>

            {/* Action buttons */}
            {state.parsedWords.length > 0 && (
                <div className="flex gap-3 mt-6">
                    <button
                        id="import-to-flashcard-btn"
                        onClick={handleOpenModal}
                        className="flex-1 py-4 bg-gradient-to-r from-accent-emerald to-accent-cyan text-white rounded-xl font-bold glow-btn text-lg"
                    >
                        ✅ Thêm {state.selectedCount} từ vào Flashcard
                    </button>
                </div>
            )}

            {/* Deck Select Modal */}
            <DeckSelectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                cards={getSelectedCards()}
                onSuccess={handleImportSuccess}
            />
        </div>
    );
};

/* ─── Sub-components ────────────────────────────────────────────────────────── */

interface StatsCardsProps {
    total: number;
    selected: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ total, selected }) => (
    <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 border border-accent-emerald/20">
            <p className="text-slate-400 text-sm">Tổng</p>
            <p className="text-2xl font-display font-bold text-accent-emerald">
                {total}
            </p>
        </div>
        <div className="glass-card p-4 border border-accent-indigo/20">
            <p className="text-slate-400 text-sm">Đã chọn</p>
            <p className="text-2xl font-display font-bold text-accent-indigo-light">
                {selected}
            </p>
        </div>
    </div>
);

interface WordListProps {
    words: {
        id: string;
        word: string;
        meaning: string;
        pronunciation?: string;
        partOfSpeech?: string;
        example?: string;
        selected: boolean;
    }[];
    onToggle: (id: string) => void;
}

const PART_OF_SPEECH_COLOR: Record<string, string> = {
    noun: 'text-accent-cyan',
    verb: 'text-accent-emerald',
    adjective: 'text-accent-indigo-light',
    adverb: 'text-yellow-400',
    preposition: 'text-orange-400',
    pronoun: 'text-pink-400',
    conjunction: 'text-purple-400',
    interjection: 'text-red-400',
};

const WordList: React.FC<WordListProps> = ({ words, onToggle }) => (
    <div className="glass-card overflow-hidden">
        <div className="max-h-[480px] overflow-y-auto">
            {words.map((item) => (
                <div
                    key={item.id}
                    onClick={() => onToggle(item.id)}
                    className={`p-3 border-b border-white/[0.04] cursor-pointer transition-all ${
                        item.selected
                            ? 'bg-accent-indigo/5'
                            : 'opacity-40 hover:opacity-60'
                    }`}
                >
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => {}}
                            className="mt-1 w-4 h-4 cursor-pointer flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 space-y-0.5">
                            {/* Word + phonetic + part-of-speech */}
                            <div className="flex flex-wrap items-baseline gap-1.5">
                                <span className="font-semibold text-slate-100 text-sm">
                                    {item.word}
                                </span>
                                {item.pronunciation && (
                                    <span className="text-accent-cyan text-xs font-mono">
                                        {item.pronunciation}
                                    </span>
                                )}
                                {item.partOfSpeech && (
                                    <span
                                        className={`text-xs italic ${
                                            PART_OF_SPEECH_COLOR[
                                                item.partOfSpeech.toLowerCase()
                                            ] ?? 'text-slate-400'
                                        }`}
                                    >
                                        {item.partOfSpeech}
                                    </span>
                                )}
                            </div>

                            {/* Meaning */}
                            <p className="text-slate-300 text-xs">
                                {item.meaning}
                            </p>

                            {/* Example */}
                            {item.example && (
                                <p className="text-slate-500 text-xs italic border-l-2 border-accent-indigo/30 pl-2 mt-1">
                                    {item.example}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);



interface EmptyResultStateProps {
    isLoading: boolean;
}

const EmptyResultState: React.FC<EmptyResultStateProps> = ({ isLoading }) => {
    if (isLoading) {
        return (
            <div className="text-center py-16 text-slate-500">
                <div className="text-5xl mb-4 animate-pulse">🤖</div>
                <p className="text-base text-slate-400">AI đang xử lý...</p>
                <p className="text-sm mt-1">Kết quả sẽ hiện ở đây</p>
            </div>
        );
    }

    return (
        <div className="text-center py-16 text-slate-500">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-lg text-slate-400">Kết quả sẽ hiện ở đây</p>
            <p className="text-sm mt-1">
                Chọn một tab và để AI tạo từ vựng cho bạn
            </p>
        </div>
    );
};

export default ImportVocabularyPage;
