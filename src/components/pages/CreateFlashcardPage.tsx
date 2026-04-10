'use client';

import React from 'react';
import { CreateFlashcardForm } from '@/components/ui/CreateFlashcardForm';

export const CreateFlashcardPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">🆕 Tạo Flashcard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <CreateFlashcardForm isLoading={false} />
                </div>

                {/* Tips */}
                <div className="bg-blue-50 rounded-xl shadow-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-blue-900 mb-4">💡 Mẹo tạo flashcard tốt</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li>📌 Từ tiếng Anh là bắt buộc</li>
                        <li>📌 Cho thêm phiên âm giúp phát âm đúng</li>
                        <li>📌 Ví dụ sẽ giúp hiểu ngữ pháp</li>
                        <li>📌 Hình ảnh giúp ghi nhớ lâu hơn</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CreateFlashcardPage;
