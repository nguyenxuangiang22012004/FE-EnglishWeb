'use client';

import React from 'react';

interface CreateFlashcardFormProps {
    onSubmit?: (data: {
        word: string;
        meaning: string;
        pronunciation?: string;
        example?: string;
        image?: string;
    }) => void;
    isLoading?: boolean;
}

export const CreateFlashcardForm: React.FC<CreateFlashcardFormProps> = ({
    onSubmit,
    isLoading,
}) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSubmit?.({
            word: formData.get('word') as string,
            meaning: formData.get('meaning') as string,
            pronunciation: formData.get('pronunciation') as string,
            example: formData.get('example') as string,
            image: formData.get('image') as string,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">➕ Tạo Flashcard Mới</h2>

            <div className="space-y-4">
                {/* Word */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Từ tiếng Anh *
                    </label>
                    <input
                        type="text"
                        name="word"
                        required
                        placeholder="e.g., Apple"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* Meaning */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nghĩa tiếng Việt *
                    </label>
                    <input
                        type="text"
                        name="meaning"
                        required
                        placeholder="e.g., Quả táo"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* Pronunciation */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phiên âm (tuỳ chọn)
                    </label>
                    <input
                        type="text"
                        name="pronunciation"
                        placeholder="e.g., /ˈæpl/"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* Example */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ví dụ (tuỳ chọn)
                    </label>
                    <textarea
                        name="example"
                        placeholder="I eat an apple every day."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 h-24"
                    />
                </div>

                {/* Image */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Hình ảnh (tuỳ chọn)
                    </label>
                    <input
                        type="text"
                        name="image"
                        placeholder="URL của hình ảnh"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
                >
                    {isLoading ? '⏳ Đang tạo...' : '✅ Tạo Flashcard'}
                </button>
            </div>
        </form>
    );
};

export default CreateFlashcardForm;
