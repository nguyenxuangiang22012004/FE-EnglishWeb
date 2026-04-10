'use client';

import React from 'react';
import { ImportDragDrop } from '@/components/ui/ImportDragDrop';

export const ImportPage: React.FC = () => {
    const handleImportText = (text: string) => {
        console.log('Import text:', text);
    };

    const handleImportFile = (file: File) => {
        console.log('Import file:', file);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">📁 Import Từ Vựng</h1>

            <ImportDragDrop
                onImportText={handleImportText}
                onImportFile={handleImportFile}
                isLoading={false}
            />

            {/* Examples */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Định dạng hỗ trợ</h2>

                <div className="space-y-6">
                    {/* Text Format */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">📝 Định dạng text (paste):</h3>
                        <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm space-y-1">
                            <p>hello - xin chào</p>
                            <p>world - thế giới</p>
                            <p>apple - quả táo</p>
                            <p className="text-gray-500">... (một từ mỗi dòng)</p>
                        </div>
                    </div>

                    {/* CSV Format */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Định dạng CSV:</h3>
                        <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm space-y-1">
                            <p>word,meaning,pronunciation</p>
                            <p>hello,xin chào,/həˈloʊ/</p>
                            <p>world,thế giới,/wɜːrld/</p>
                        </div>
                    </div>

                    {/* Excel Format */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">📈 Định dạng Excel:</h3>
                        <p className="text-gray-600">Cột A: Từ tiếng Anh | Cột B: Nghĩa | Cột C (tuỳ chọn): Phiên âm</p>
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="bg-green-50 rounded-xl shadow-lg p-6 border border-green-200">
                <h3 className="text-lg font-bold text-green-900 mb-4">💡 Mẹo hữu ích</h3>
                <ul className="space-y-2 text-green-800">
                    <li>✅ Sử dụng ChatGPT để generate từ vựng + ví dụ</li>
                    <li>✅ Copy dữ liệu từ các nguồn hỗ trợ CSV/Excel</li>
                    <li>✅ AI sẽ tự động chuẩn hóa dữ liệu</li>
                    <li>✅ Review trước khi import chính thức</li>
                </ul>
            </div>
        </div>
    );
};

export default ImportPage;
