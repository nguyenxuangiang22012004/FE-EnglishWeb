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
            <h1 className="text-3xl font-display font-bold text-slate-100">🆕 Tạo Flashcard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Form chiếm 3/4 */}
                <div className="lg:col-span-3">
                    <CreateFlashcardForm onSubmit={handleSubmit} isLoading={false} />
                </div>

                {/* Tips chiếm 1/4 */}
                <div className="glass-card p-5 border border-accent-indigo/20 bg-gradient-to-br from-accent-indigo/5 to-transparent h-fit">
                    <h3 className="text-base font-display font-bold text-accent-indigo-light mb-3">💡 Mẹo nhập nhanh</h3>
                    <ul className="space-y-2.5 text-sm text-slate-300">
                        <li className="flex items-start gap-2"><span className="text-accent-emerald">✦</span> Nhấn <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs text-slate-300 border border-white/10">Enter</kbd> để tạo hàng mới</li>
                        <li className="flex items-start gap-2"><span className="text-accent-emerald">✦</span> Chỉ cần điền Từ + Nghĩa là bắt buộc</li>
                        <li className="flex items-start gap-2"><span className="text-accent-emerald">✦</span> Phiên âm giúp phát âm đúng hơn</li>
                        <li className="flex items-start gap-2"><span className="text-accent-emerald">✦</span> Ví dụ giúp hiểu ngữ cảnh sử dụng</li>
                        <li className="flex items-start gap-2"><span className="text-accent-emerald">✦</span> Hình ảnh giúp ghi nhớ lâu hơn</li>
                        <li className="flex items-start gap-2"><span className="text-accent-emerald">✦</span> Thêm 5 hàng cùng lúc để nhập nhanh</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CreateFlashcardPage;