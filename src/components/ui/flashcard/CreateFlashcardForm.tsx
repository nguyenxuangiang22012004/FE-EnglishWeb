'use client';

import React, { useState, useCallback } from 'react';

interface FlashcardRow {
    id: number;
    word: string;
    meaning: string;
    pronunciation: string;
    example: string;
    image: string;
}

interface CreateFlashcardFormProps {
    onSubmit?: (data: Omit<FlashcardRow, 'id'>[]) => void;
    isLoading?: boolean;
}

let nextId = 1;

const createRow = (): FlashcardRow => ({
    id: nextId++,
    word: '',
    meaning: '',
    pronunciation: '',
    example: '',
    image: '',
});

export const CreateFlashcardForm: React.FC<CreateFlashcardFormProps> = ({
    onSubmit,
    isLoading,
}) => {
    const [rows, setRows] = useState<FlashcardRow[]>([createRow(), createRow(), createRow()]);

    const addRow = useCallback((count = 1) => {
        setRows(prev => [...prev, ...Array.from({ length: count }, createRow)]);
    }, []);

    const deleteRow = useCallback((id: number) => {
        setRows(prev => (prev.length > 1 ? prev.filter(r => r.id !== id) : prev));
    }, []);

    const updateField = useCallback(
        (id: number, field: keyof Omit<FlashcardRow, 'id'>, value: string) => {
            setRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));
        },
        []
    );

    const clearAll = () => setRows([createRow()]);

    const handleSubmit = () => {
        const valid = rows.filter(r => r.word.trim() && r.meaning.trim());
        if (valid.length === 0) return;
        onSubmit?.(valid.map(({ id, ...rest }) => rest));
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        rowIndex: number
    ) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (rowIndex === rows.length - 1) {
                addRow();
                setTimeout(() => {
                    const inputs = document.querySelectorAll<HTMLInputElement>(
                        'table tbody tr:last-child td:nth-child(2) input'
                    );
                    inputs[0]?.focus();
                }, 50);
            } else {
                const allRows = document.querySelectorAll<HTMLInputElement>(
                    'table tbody tr td:nth-child(2) input'
                );
                allRows[rowIndex + 1]?.focus();
            }
        }
    };

    const validCount = rows.filter(r => r.word.trim() && r.meaning.trim()).length;

    const inputClass =
        'w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-transparent focus:outline-none focus:border-blue-400 focus:bg-blue-50 placeholder-gray-300 transition-colors';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">➕ Tạo Flashcard Mới</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Mỗi hàng là một flashcard — nhấn Enter để thêm hàng mới</p>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => addRow(1)}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                        + Thêm hàng
                    </button>
                    <button
                        type="button"
                        onClick={() => addRow(5)}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                        + Thêm 5 hàng
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full min-w-[700px] border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="w-9 px-3 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">#</th>
                            <th className="px-2 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left min-w-[130px]">
                                Từ tiếng Anh <span className="text-red-400">*</span>
                            </th>
                            <th className="px-2 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left min-w-[130px]">
                                Nghĩa tiếng Việt <span className="text-red-400">*</span>
                            </th>
                            <th className="px-2 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left min-w-[110px]">Phiên âm</th>
                            <th className="px-2 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left min-w-[180px]">Ví dụ</th>
                            <th className="px-2 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left min-w-[130px]">URL hình ảnh</th>
                            <th className="w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {rows.map((row, idx) => (
                            <tr key={row.id} className="hover:bg-gray-50/60 transition-colors group">
                                <td className="px-3 py-2 text-xs text-gray-300 text-center font-medium">{idx + 1}</td>
                                <td className="px-2 py-2">
                                    <input
                                        type="text"
                                        placeholder="e.g. Resilient"
                                        value={row.word}
                                        onChange={e => updateField(row.id, 'word', e.target.value)}
                                        onKeyDown={e => handleKeyDown(e, idx)}
                                        className={inputClass}
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="text"
                                        placeholder="Kiên cường"
                                        value={row.meaning}
                                        onChange={e => updateField(row.id, 'meaning', e.target.value)}
                                        className={inputClass}
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="text"
                                        placeholder="/rɪˈzɪliənt/"
                                        value={row.pronunciation}
                                        onChange={e => updateField(row.id, 'pronunciation', e.target.value)}
                                        className={inputClass}
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="text"
                                        placeholder="She is very resilient."
                                        value={row.example}
                                        onChange={e => updateField(row.id, 'example', e.target.value)}
                                        className={inputClass}
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        value={row.image}
                                        onChange={e => updateField(row.id, 'image', e.target.value)}
                                        className={inputClass}
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <button
                                        type="button"
                                        onClick={() => deleteRow(row.id)}
                                        disabled={rows.length <= 1}
                                        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-300 hover:text-red-400 hover:bg-red-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all opacity-0 group-hover:opacity-100"
                                        title="Xoá hàng này"
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-400">
                    Tổng: <span className="font-semibold text-gray-700">{validCount}</span> từ hợp lệ
                </p>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={clearAll}
                        className="px-4 py-2 text-sm border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        Xoá tất cả
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading || validCount === 0}
                        className="px-5 py-2 text-sm bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? '⏳ Đang lưu...' : `✅ Lưu ${validCount > 0 ? validCount : ''} Flashcard`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateFlashcardForm;