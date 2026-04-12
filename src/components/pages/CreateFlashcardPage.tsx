'use client';

import React from 'react';
import { CreateFlashcardForm } from '@/components/ui/flashcard/CreateFlashcardForm';

export const CreateFlashcardPage: React.FC = () => {
    const handleSubmit = (data: {
        word: string;
        meaning: string;
        pronunciation?: string;
        example?: string;
        image?: string;
    }[]) => {
        console.log('Flashcards to save:', data);
        // TODO: gọi API lưu danh sách flashcard ở đây
    };

    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">🆕 Tạo Flashcard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Form chiếm 3/4 */}
                <div className="lg:col-span-3">
                    <CreateFlashcardForm onSubmit={handleSubmit} isLoading={false} />
                </div>

                {/* Tips chiếm 1/4 */}
                <div className="bg-blue-50 rounded-xl shadow-sm p-5 border border-blue-100 h-fit">
                    <h3 className="text-base font-bold text-blue-900 mb-3">💡 Mẹo nhập nhanh</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li>⌨️ Nhấn <kbd className="bg-blue-100 px-1 rounded text-xs">Enter</kbd> để tạo hàng mới</li>
                        <li>📌 Chỉ cần điền Từ + Nghĩa là bắt buộc</li>
                        <li>📌 Phiên âm giúp phát âm đúng hơn</li>
                        <li>📌 Ví dụ giúp hiểu ngữ cảnh sử dụng</li>
                        <li>🖼️ Hình ảnh giúp ghi nhớ lâu hơn</li>
                        <li>➕ Thêm 5 hàng cùng lúc để nhập nhanh</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CreateFlashcardPage;