'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store';
import { addFlashcards } from '@/store/slices/flashcardSlice';

interface ParsedWord {
    id: string;
    word: string;
    meaning: string;
    selected: boolean;
}

interface ImportState {
    rawText: string;
    parsedWords: ParsedWord[];
    jsonData: string;
    selectedCount: number;
}

export const ImportVocabularyPage: React.FC = () => {
    const [state, setState] = useState<ImportState>({
        rawText: '',
        parsedWords: [],
        jsonData: '',
        selectedCount: 0,
    });

    const dispatch = useAppDispatch();
    const router = useRouter();

    const parseText = (text: string): ParsedWord[] => {
        const lines = text.split('\n').filter((line) => line.trim());
        const parsed: ParsedWord[] = [];
        lines.forEach((line, idx) => {
            let word = '';
            let meaning = '';
            if (line.includes('---') && line.includes('|')) return;
            if (line.includes('|') && !line.includes('---')) {
                const parts = line.split('|').map((p) => p.trim()).filter((p) => p && !p.includes('---'));
                if (parts.length >= 2) { word = parts[0]; meaning = parts.slice(1).join('|').trim(); }
            } else if (line.includes('→') || line.includes('->') || line.includes(':') || line.includes(' - ')) {
                const separators = ['→', '->', ':', ' - '];
                for (const sep of separators) {
                    if (line.includes(sep)) {
                        const parts = line.split(sep).map((p) => p.trim());
                        if (parts.length >= 2) { word = parts[0]; meaning = parts.slice(1).join(sep).trim(); break; }
                    }
                }
            } else if (line.includes(',')) {
                const parts = line.split(',').map((p) => p.trim());
                if (parts.length >= 2) { word = parts[0]; meaning = parts.slice(1).join(',').trim(); }
            } else if (line.match(/^[\s]*[-*+]\s+/)) {
                const cleanLine = line.replace(/^[\s]*[-*+]\s+/, '');
                if (cleanLine.includes(':')) {
                    const parts = cleanLine.split(':').map((p) => p.trim());
                    if (parts.length >= 2) { word = parts[0]; meaning = parts.slice(1).join(':').trim(); }
                }
            }
            if (word && meaning) {
                parsed.push({ id: `word-${idx}-${Date.now()}`, word: word.trim(), meaning: meaning.trim(), selected: true });
            }
        });
        return parsed;
    };

    const parseJSON = (text: string): ParsedWord[] => {
        try {
            const data = JSON.parse(text);
            if (Array.isArray(data)) {
                return data.filter((item) => item.word && (item.meaning || item.translation || item.definition))
                    .map((item, idx) => ({ id: `word-${idx}-${Date.now()}`, word: item.word || '', meaning: item.meaning || item.translation || item.definition || '', selected: true }));
            }
        } catch (e) { return []; }
        return [];
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setState((prev) => ({ ...prev, rawText: text }));
        let parsed: ParsedWord[] = [];
        if (text.trim().startsWith('[') || text.trim().startsWith('{')) { parsed = parseJSON(text); }
        if (parsed.length === 0) { parsed = parseText(text); }
        const jsonData = JSON.stringify(parsed.map((p) => ({ word: p.word, meaning: p.meaning, pronunciation: '', example: '' })), null, 2);
        setState((prev) => ({ ...prev, parsedWords: parsed, jsonData, selectedCount: parsed.length }));
    };

    const toggleWordSelection = (id: string) => {
        setState((prev) => {
            const updated = prev.parsedWords.map((w) => w.id === id ? { ...w, selected: !w.selected } : w);
            const count = updated.filter((w) => w.selected).length;
            const jsonData = JSON.stringify(updated.filter((w) => w.selected).map((p) => ({ word: p.word, meaning: p.meaning, pronunciation: '', example: '' })), null, 2);
            return { ...prev, parsedWords: updated, jsonData, selectedCount: count };
        });
    };

    const toggleSelectAll = () => {
        const allSelected = state.parsedWords.every((w) => w.selected);
        setState((prev) => {
            const updated = prev.parsedWords.map((w) => ({ ...w, selected: !allSelected }));
            const count = updated.filter((w) => w.selected).length;
            const jsonData = JSON.stringify(updated.filter((w) => w.selected).map((p) => ({ word: p.word, meaning: p.meaning, pronunciation: '', example: '' })), null, 2);
            return { ...prev, parsedWords: updated, jsonData, selectedCount: count };
        });
    };

    const copyJson = () => { navigator.clipboard.writeText(state.jsonData); alert('✅ JSON copied to clipboard!'); };

    const addToFlashcard = () => {
        const selected = state.parsedWords.filter((w) => w.selected);
        if (selected.length === 0) { alert('❌ Vui lòng chọn ít nhất 1 từ'); return; }
        const flashcardsToAdd = selected.map((word) => ({ id: `card-${Date.now()}-${Math.random()}`, word: word.word, meaning: word.meaning, pronunciation: '', example: '', status: 'unknown' as const, createdAt: new Date().toISOString() }));
        dispatch(addFlashcards(flashcardsToAdd));
        alert(`✅ Đã thêm ${selected.length} từ vào flashcard!`);
        setState({ rawText: '', parsedWords: [], jsonData: '', selectedCount: 0 });
        setTimeout(() => { router.push('/flashcards'); }, 500);
    };

    const handleClear = () => { setState({ rawText: '', parsedWords: [], jsonData: '', selectedCount: 0 }); };

    const allSelected = state.parsedWords.length > 0 && state.parsedWords.every((w) => w.selected);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-display font-bold text-slate-100">📥 Import Từ Vựng</h1>
                <button onClick={handleClear} className="px-4 py-2 bg-accent-rose/10 border border-accent-rose/20 text-accent-rose rounded-xl hover:bg-accent-rose/20 text-sm font-medium transition-all">🗑️ Clear</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="glass-card p-5 border border-accent-indigo/20 bg-gradient-to-br from-accent-indigo/5 to-transparent">
                        <h3 className="font-display font-bold text-accent-indigo-light mb-3">📋 Hướng dẫn</h3>
                        <div className="space-y-2 text-sm text-slate-300">
                            <p className="font-medium text-accent-emerald">✅ Định dạng hỗ trợ:</p>
                            <div className="bg-white/[0.03] rounded-xl p-3 font-mono text-xs border border-white/[0.04] space-y-1">
                                <div className="text-slate-500">word → meaning</div>
                                <div className="text-slate-500">word - meaning</div>
                                <div className="text-slate-500">word, meaning</div>
                                <div className="text-slate-500">- word: meaning</div>
                                <div className="text-slate-500">| word | meaning |</div>
                                <div className="text-slate-500">{`[{"word":"..","meaning":".."}]`}</div>
                            </div>
                            <p className="text-accent-amber font-medium">💡 Mỗi từ một dòng (trừ JSON)</p>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">📝 Dán từ vựng ở đây</label>
                        <textarea value={state.rawText} onChange={handleTextChange} placeholder={`apple → quả táo\nhello → xin chào`} className="w-full h-64 px-4 py-3 glass-input font-mono text-sm resize-none" />
                    </div>
                </div>

                <div className="space-y-4">
                    {state.parsedWords.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="glass-card p-4 border border-accent-emerald/20"><p className="text-slate-400 text-sm">Tổng</p><p className="text-2xl font-display font-bold text-accent-emerald">{state.parsedWords.length}</p></div>
                            <div className="glass-card p-4 border border-accent-indigo/20"><p className="text-slate-400 text-sm">Đã chọn</p><p className="text-2xl font-display font-bold text-accent-indigo-light">{state.selectedCount}</p></div>
                        </div>
                    )}
                    {state.parsedWords.length > 0 && (
                        <button onClick={toggleSelectAll} className={`w-full py-2.5 rounded-xl font-medium transition text-sm ${allSelected ? 'bg-white/[0.06] text-slate-400 border border-white/[0.06]' : 'bg-accent-indigo/10 text-accent-indigo-light border border-accent-indigo/20'}`}>
                            {allSelected ? '✓ Bỏ chọn tất cả' : '□ Chọn tất cả'}
                        </button>
                    )}
                    {state.parsedWords.length > 0 && (
                        <div className="glass-card overflow-hidden">
                            <div className="max-h-64 overflow-y-auto">
                                {state.parsedWords.map((item) => (
                                    <div key={item.id} onClick={() => toggleWordSelection(item.id)} className={`p-3 border-b border-white/[0.04] cursor-pointer transition-all ${item.selected ? 'bg-accent-indigo/5' : 'opacity-40 hover:opacity-60'}`}>
                                        <div className="flex items-start gap-3">
                                            <input type="checkbox" checked={item.selected} onChange={() => {}} className="mt-1 w-4 h-4 cursor-pointer" />
                                            <div className="flex-1 min-w-0"><p className="font-medium text-slate-200 text-sm">{item.word}</p><p className="text-slate-400 text-xs">{item.meaning}</p></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {state.parsedWords.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-slate-300">📄 JSON</label>
                                <button onClick={copyJson} className="text-xs px-3 py-1.5 bg-white/[0.06] text-slate-400 rounded-lg hover:bg-white/[0.1] transition-all border border-white/[0.06]">📋 Copy</button>
                            </div>
                            <pre className="bg-surface-800 text-accent-emerald p-4 rounded-xl text-xs overflow-auto max-h-32 border border-white/[0.06]">{state.jsonData}</pre>
                        </div>
                    )}
                </div>
            </div>

            {state.parsedWords.length > 0 && (
                <div className="flex gap-3 mt-6">
                    <button onClick={addToFlashcard} className="flex-1 py-4 bg-gradient-to-r from-accent-emerald to-accent-cyan text-white rounded-xl font-bold glow-btn text-lg">✅ Thêm {state.selectedCount} từ vào Flashcard</button>
                    <button onClick={copyJson} className="px-6 py-4 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl font-bold transition-all border border-white/[0.06]">📋 Copy JSON</button>
                </div>
            )}

            {state.parsedWords.length === 0 && state.rawText === '' && (
                <div className="text-center py-16 text-slate-500"><div className="text-6xl mb-4">📙</div><p className="text-lg">Dán hoặc gõ từ vựng để bắt đầu</p></div>
            )}
            {state.rawText && state.parsedWords.length === 0 && (
                <div className="bg-accent-amber/10 border border-accent-amber/20 rounded-xl p-4 text-accent-amber"><p className="font-semibold">⚠️ Không tìm thấy từ nào</p><p className="text-sm mt-1 text-accent-amber/80">Kiểm tra định dạng: word → meaning</p></div>
            )}
        </div>
    );
};

export default ImportVocabularyPage;
