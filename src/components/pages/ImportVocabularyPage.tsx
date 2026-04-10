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

    // Parse text with multiple format support
    const parseText = (text: string): ParsedWord[] => {
        const lines = text.split('\n').filter((line) => line.trim());
        const parsed: ParsedWord[] = [];

        lines.forEach((line, idx) => {
            let word = '';
            let meaning = '';

            // Skip markdown table separators
            if (line.includes('---') && line.includes('|')) {
                return;
            }

            // Format 1: Table format (| word | meaning |)
            if (line.includes('|') && !line.includes('---')) {
                const parts = line
                    .split('|')
                    .map((p) => p.trim())
                    .filter((p) => p && !p.includes('---'));
                if (parts.length >= 2) {
                    word = parts[0];
                    meaning = parts.slice(1).join('|').trim();
                }
            }
            // Format 2: Arrow or colon (→, ->, :, -)
            else if (line.includes('→') || line.includes('->') || line.includes(':') || line.includes(' - ')) {
                const separators = ['→', '->', ':', ' - '];
                for (const sep of separators) {
                    if (line.includes(sep)) {
                        const parts = line.split(sep).map((p) => p.trim());
                        if (parts.length >= 2) {
                            word = parts[0];
                            meaning = parts.slice(1).join(sep).trim();
                            break;
                        }
                    }
                }
            }
            // Format 3: Comma separated
            else if (line.includes(',')) {
                const parts = line.split(',').map((p) => p.trim());
                if (parts.length >= 2) {
                    word = parts[0];
                    meaning = parts.slice(1).join(',').trim();
                }
            }
            // Format 4: Bullet points (-, *, +)
            else if (line.match(/^[\s]*[-*+]\s+/)) {
                const cleanLine = line.replace(/^[\s]*[-*+]\s+/, '');
                if (cleanLine.includes(':')) {
                    const parts = cleanLine.split(':').map((p) => p.trim());
                    if (parts.length >= 2) {
                        word = parts[0];
                        meaning = parts.slice(1).join(':').trim();
                    }
                }
            }

            if (word && meaning) {
                parsed.push({
                    id: `word-${idx}-${Date.now()}`,
                    word: word.trim(),
                    meaning: meaning.trim(),
                    selected: true,
                });
            }
        });

        return parsed;
    };

    // Parse JSON array format
    const parseJSON = (text: string): ParsedWord[] => {
        try {
            const data = JSON.parse(text);
            if (Array.isArray(data)) {
                return data
                    .filter((item) => item.word && (item.meaning || item.translation || item.definition))
                    .map((item, idx) => ({
                        id: `word-${idx}-${Date.now()}`,
                        word: item.word || '',
                        meaning: item.meaning || item.translation || item.definition || '',
                        selected: true,
                    }));
            }
        } catch (e) {
            return [];
        }
        return [];
    };

    // Handle textarea change
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setState((prev) => ({ ...prev, rawText: text }));

        let parsed: ParsedWord[] = [];

        // Try JSON first if it looks like JSON
        if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
            parsed = parseJSON(text);
        }

        // Otherwise or if JSON parsing failed, try text parsing
        if (parsed.length === 0) {
            parsed = parseText(text);
        }

        // Generate JSON output
        const jsonData = JSON.stringify(
            parsed.map((p) => ({
                word: p.word,
                meaning: p.meaning,
                pronunciation: '',
                example: '',
            })),
            null,
            2
        );

        setState((prev) => ({
            ...prev,
            parsedWords: parsed,
            jsonData,
            selectedCount: parsed.length,
        }));
    };

    // Toggle word selection
    const toggleWordSelection = (id: string) => {
        setState((prev) => {
            const updated = prev.parsedWords.map((w) =>
                w.id === id ? { ...w, selected: !w.selected } : w
            );
            const count = updated.filter((w) => w.selected).length;

            const jsonData = JSON.stringify(
                updated
                    .filter((w) => w.selected)
                    .map((p) => ({
                        word: p.word,
                        meaning: p.meaning,
                        pronunciation: '',
                        example: '',
                    })),
                null,
                2
            );

            return {
                ...prev,
                parsedWords: updated,
                jsonData,
                selectedCount: count,
            };
        });
    };

    // Select/deselect all
    const toggleSelectAll = () => {
        const allSelected = state.parsedWords.every((w) => w.selected);
        setState((prev) => {
            const updated = prev.parsedWords.map((w) => ({
                ...w,
                selected: !allSelected,
            }));
            const count = updated.filter((w) => w.selected).length;

            const jsonData = JSON.stringify(
                updated
                    .filter((w) => w.selected)
                    .map((p) => ({
                        word: p.word,
                        meaning: p.meaning,
                        pronunciation: '',
                        example: '',
                    })),
                null,
                2
            );

            return {
                ...prev,
                parsedWords: updated,
                jsonData,
                selectedCount: count,
            };
        });
    };

    // Copy JSON to clipboard
    const copyJson = () => {
        navigator.clipboard.writeText(state.jsonData);
        alert('✅ JSON copied to clipboard!');
    };

    // Add to flashcard
    const addToFlashcard = () => {
        const selected = state.parsedWords.filter((w) => w.selected);
        if (selected.length === 0) {
            alert('❌ Vui lòng chọn ít nhất 1 từ');
            return;
        }

        const flashcardsToAdd = selected.map((word) => ({
            id: `card-${Date.now()}-${Math.random()}`,
            word: word.word,
            meaning: word.meaning,
            pronunciation: '',
            example: '',
            status: 'unknown' as const,
            createdAt: new Date().toISOString(),
        }));

        dispatch(addFlashcards(flashcardsToAdd));
        alert(`✅ Đã thêm ${selected.length} từ vào flashcard!`);

        setState({
            rawText: '',
            parsedWords: [],
            jsonData: '',
            selectedCount: 0,
        });

        setTimeout(() => {
            router.push('/flashcards');
        }, 500);
    };

    // Clear all
    const handleClear = () => {
        setState({
            rawText: '',
            parsedWords: [],
            jsonData: '',
            selectedCount: 0,
        });
    };

    const allSelected =
        state.parsedWords.length > 0 && state.parsedWords.every((w) => w.selected);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-gray-800">📥 Import Từ Vựng</h1>
                <button
                    onClick={handleClear}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                    🗑️ Clear
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Input & Instructions */}
                <div className="space-y-4">
                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h3 className="font-bold text-blue-900 mb-3">📋 Hướng dẫn sử dụng</h3>
                        <div className="space-y-3 text-sm text-blue-800">
                            <p className="font-semibold">✅ Hỗ trợ các định dạng:</p>

                            <div className="space-y-2 bg-white rounded p-3 font-mono text-xs">
                                <div className="font-bold text-gray-700 mb-2">1️⃣ Mũi tên:</div>
                                <div>word → meaning</div>
                                <div className="text-gray-500">apple → quả táo</div>

                                <div className="font-bold text-gray-700 mt-3 mb-2">2️⃣ Dấu gạch ngang:</div>
                                <div>word - meaning</div>
                                <div className="text-gray-500">apple - quả táo</div>

                                <div className="font-bold text-gray-700 mt-3 mb-2">3️⃣ Dấu phẩy:</div>
                                <div>word, meaning</div>
                                <div className="text-gray-500">apple, quả táo</div>

                                <div className="font-bold text-gray-700 mt-3 mb-2">4️⃣ Bullet points:</div>
                                <div>- word: meaning</div>
                                <div className="text-gray-500">- apple: quả táo</div>

                                <div className="font-bold text-gray-700 mt-3 mb-2">5️⃣ Bảng Markdown:</div>
                                <div className="text-gray-500">| word | meaning |</div>

                                <div className="font-bold text-gray-700 mt-3 mb-2">6️⃣ JSON Array:</div>
                                <div className="text-gray-500 text-2xs">{`[{"word":"hello","meaning":"xin chào"}]`}</div>
                            </div>

                            <p className="text-blue-700 font-semibold mt-3">💡 Mỗi từ một dòng (trừ JSON)</p>
                        </div>
                    </div>

                    {/* Textarea */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            📝 Dán từ vựng ở đây
                        </label>
                        <textarea
                            value={state.rawText}
                            onChange={handleTextChange}
                            placeholder={`apple → quả táo
hello → xin chào
hi → chào
father → bố / cha`}
                            className="w-full h-64 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-2">Hỗ trợ: →, -&gt;, -, |, :, JSON</p>
                    </div>
                </div>

                {/* Right: Preview & JSON */}
                <div className="space-y-4">
                    {/* Stats */}
                    {state.parsedWords.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <p className="text-gray-600 text-sm">Tổng cộng</p>
                                <p className="text-2xl font-bold text-green-600">{state.parsedWords.length}</p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <p className="text-gray-600 text-sm">Đã chọn</p>
                                <p className="text-2xl font-bold text-blue-600">{state.selectedCount}</p>
                            </div>
                        </div>
                    )}

                    {/* Select All Button */}
                    {state.parsedWords.length > 0 && (
                        <button
                            onClick={toggleSelectAll}
                            className={`w-full py-2 rounded-lg font-semibold transition text-sm ${allSelected
                                    ? 'bg-gray-300 text-gray-700'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                        >
                            {allSelected ? '✓ Bỏ chọn tất cả' : '□ Chọn tất cả'}
                        </button>
                    )}

                    {/* Preview List */}
                    {state.parsedWords.length > 0 && (
                        <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                            <div className="max-h-64 overflow-y-auto">
                                {state.parsedWords.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleWordSelection(item.id)}
                                        className={`p-3 border-b cursor-pointer transition ${item.selected
                                                ? 'bg-blue-50 border-blue-200'
                                                : 'bg-gray-50 opacity-50 hover:opacity-75'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                checked={item.selected}
                                                onChange={() => { }}
                                                className="mt-1 w-4 h-4 cursor-pointer"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-800 text-sm">{item.word}</p>
                                                <p className="text-gray-600 text-xs">{item.meaning}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* JSON Export */}
                    {state.parsedWords.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-gray-700">📄 JSON Format</label>
                                <button
                                    onClick={copyJson}
                                    className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                    📋 Copy
                                </button>
                            </div>
                            <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-auto max-h-32 border border-gray-700 break-words">
                                {state.jsonData}
                            </pre>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            {state.parsedWords.length > 0 && (
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={addToFlashcard}
                        className="flex-1 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:shadow-lg transition text-lg"
                    >
                        ✅ Thêm {state.selectedCount} từ vào Flashcard
                    </button>
                    <button
                        onClick={copyJson}
                        className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-bold transition"
                    >
                        📋 Copy JSON
                    </button>
                </div>
            )}

            {/* Empty State */}
            {state.parsedWords.length === 0 && state.rawText === '' && (
                <div className="text-center py-16 text-gray-500">
                    <div className="text-6xl mb-4">📙</div>
                    <p className="text-lg">Dán hoặc gõ từ vựng để bắt đầu</p>
                </div>
            )}

            {/* Error State */}
            {state.rawText && state.parsedWords.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-yellow-800">
                    <p className="font-semibold">⚠️ Không tìm thấy từ nào</p>
                    <p className="text-sm mt-1">Kiểm tra định dạng: word → meaning (một dòng một từ)</p>
                </div>
            )}
        </div>
    );
};

export default ImportVocabularyPage;
