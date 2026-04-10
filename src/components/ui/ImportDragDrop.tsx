'use client';

import React, { useState } from 'react';

interface ImportDragDropProps {
    onImportText?: (text: string) => void;
    onImportFile?: (file: File) => void;
    isLoading?: boolean;
}

export const ImportDragDrop: React.FC<ImportDragDropProps> = ({
    onImportText,
    onImportFile,
    isLoading,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [pastedText, setPastedText] = useState('');

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            onImportFile?.(files[0]);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📁 Import Từ Vựng</h2>

            <div className="space-y-6">
                {/* Drag & Drop Area */}
                <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                        }`}
                >
                    <div className="text-4xl mb-3">📤</div>
                    <p className="text-gray-700 font-semibold mb-2">Kéo file Excel hoặc CSV vào đây</p>
                    <p className="text-gray-500 text-sm">hoặc</p>
                    <label className="inline-block mt-3">
                        <span className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                            Chọn file
                        </span>
                        <input type="file" accept=".csv,.xlsx,.xls" className="hidden" />
                    </label>
                </div>

                {/* Paste Text Area */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        📋 Paste từ ChatGPT hoặc các nguồn khác
                    </label>
                    <textarea
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        placeholder="Paste dữ liệu ở đây. Định dạng:&#10;from - meaning&#10;hello - xin chào&#10;world - thế giới"
                        className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* Preview */}
                {pastedText && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Preview (5 dòng đầu):</p>
                        <div className="space-y-2">
                            {pastedText
                                .split('\n')
                                .slice(0, 5)
                                .map((line, idx) => (
                                    line.trim() && (
                                        <div key={idx} className="text-sm text-gray-600">
                                            {line}
                                        </div>
                                    )
                                ))}
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    onClick={() => onImportText?.(pastedText)}
                    disabled={isLoading || !pastedText.trim()}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
                >
                    {isLoading ? '⏳ Đang xử lý...' : '✅ Import & Tạo Flashcard'}
                </button>
            </div>
        </div>
    );
};

export default ImportDragDrop;
