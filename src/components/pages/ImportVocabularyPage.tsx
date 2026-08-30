'use client';

import React, { useState } from 'react';
import { useImportVocabulary } from '@/components/hooks/useImportVocabulary';
import { DeckSelectModal } from '@/components/ui/DeckSelectModal';

export const ImportVocabularyPage: React.FC = () => {
    const {
        state,
        allSelected,
        handleTextChange,
        toggleWordSelection,
        toggleSelectAll,
        copyJson,
        clearAll,
        getSelectedCards,
    } = useImportVocabulary();

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-display font-bold text-slate-100">
                    📥 Import Từ Vựng
                </h1>
                <button
                    onClick={clearAll}
                    className="px-4 py-2 bg-accent-rose/10 border border-accent-rose/20 text-accent-rose rounded-xl hover:bg-accent-rose/20 text-sm font-medium transition-all"
                >
                    🗑️ Clear
                </button>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column - Input */}
                <div className="space-y-4">
                    <FormatGuide />
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">
                            📝 Dán từ vựng ở đây
                        </label>
                        <textarea
                            value={state.rawText}
                            onChange={handleTextChange}
                            placeholder={`apple → quả táo\nhello → xin chào`}
                            className="w-full h-64 px-4 py-3 glass-input font-mono text-sm resize-none"
                        />
                    </div>
                </div>

                {/* Right column - Preview */}
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

                    {state.parsedWords.length > 0 && (
                        <JsonPreview
                            jsonData={state.jsonData}
                            onCopy={copyJson}
                        />
                    )}
                </div>
            </div>

            {/* Action buttons */}
            {state.parsedWords.length > 0 && (
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleOpenModal}
                        className="flex-1 py-4 bg-gradient-to-r from-accent-emerald to-accent-cyan text-white rounded-xl font-bold glow-btn text-lg"
                    >
                        ✅ Thêm {state.selectedCount} từ vào Flashcard
                    </button>
                    <button
                        onClick={copyJson}
                        className="px-6 py-4 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl font-bold transition-all border border-white/[0.06]"
                    >
                        📋 Copy JSON
                    </button>
                </div>
            )}

            {/* Empty states */}
            {state.parsedWords.length === 0 && state.rawText === '' && (
                <div className="text-center py-16 text-slate-500">
                    <div className="text-6xl mb-4">📙</div>
                    <p className="text-lg">Dán hoặc gõ từ vựng để bắt đầu</p>
                </div>
            )}

            {state.rawText && state.parsedWords.length === 0 && (
                <div className="bg-accent-amber/10 border border-accent-amber/20 rounded-xl p-4 text-accent-amber">
                    <p className="font-semibold">⚠️ Không tìm thấy từ nào</p>
                    <p className="text-sm mt-1 text-accent-amber/80">
                        Kiểm tra định dạng: word → meaning
                    </p>
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

/* ─── Sub-components ────────────────────────────────────── */

const FormatGuide: React.FC = () => (
    <div className="glass-card p-5 border border-accent-indigo/20 bg-gradient-to-br from-accent-indigo/5 to-transparent">
        <h3 className="font-display font-bold text-accent-indigo-light mb-3">
            📋 Hướng dẫn
        </h3>
        <div className="space-y-2 text-sm text-slate-300">
            <p className="font-medium text-accent-emerald">✅ Định dạng hỗ trợ:</p>
            <div className="bg-white/[0.03] rounded-xl p-3 font-mono text-xs border border-white/[0.04] space-y-1">
                <div className="text-slate-500">word → meaning</div>
                <div className="text-slate-500">word - meaning</div>
                <div className="text-slate-500">word, meaning</div>
                <div className="text-slate-500">- word: meaning</div>
                <div className="text-slate-500">| word | meaning |</div>
                <div className="text-slate-500">
                    {`[{"word":"..","meaning":".."}]`}
                </div>
            </div>
            <p className="text-accent-amber font-medium">
                💡 Mỗi từ một dòng (trừ JSON)
            </p>
        </div>
    </div>
);

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
    words: { id: string; word: string; meaning: string; selected: boolean }[];
    onToggle: (id: string) => void;
}

const WordList: React.FC<WordListProps> = ({ words, onToggle }) => (
    <div className="glass-card overflow-hidden">
        <div className="max-h-64 overflow-y-auto">
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
                            className="mt-1 w-4 h-4 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-200 text-sm">
                                {item.word}
                            </p>
                            <p className="text-slate-400 text-xs">
                                {item.meaning}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

interface JsonPreviewProps {
    jsonData: string;
    onCopy: () => void;
}

const JsonPreview: React.FC<JsonPreviewProps> = ({ jsonData, onCopy }) => (
    <div>
        <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-slate-300">📄 JSON</label>
            <button
                onClick={onCopy}
                className="text-xs px-3 py-1.5 bg-white/[0.06] text-slate-400 rounded-lg hover:bg-white/[0.1] transition-all border border-white/[0.06]"
            >
                📋 Copy
            </button>
        </div>
        <pre className="bg-surface-800 text-accent-emerald p-4 rounded-xl text-xs overflow-auto max-h-32 border border-white/[0.06]">
            {jsonData}
        </pre>
    </div>
);

export default ImportVocabularyPage;
