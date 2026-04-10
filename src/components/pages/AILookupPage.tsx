'use client';

import React from 'react';
import { AILookupBox } from '@/components/ui/AILookupBox';

interface WordResult {
    word: string;
    meaning: string;
    pronunciation?: string;
    wordType?: string;
    examples?: string[];
    synonyms?: string[];
    antonyms?: string[];
}

export const AILookupPage: React.FC = () => {
    const [result, setResult] = React.useState<WordResult | undefined>(undefined);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSearch = async (word: string) => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setResult({
                word: word,
                meaning: 'Định nghĩa tiếng Việt của từ này',
                pronunciation: '/prəˈnʌnseɪʃən/',
                wordType: 'noun',
                examples: [
                    'This is the first example sentence.',
                    'Here is another example with the word.',
                    'One more example to show usage.',
                ],
                synonyms: ['similar1', 'similar2'],
                antonyms: ['opposite1', 'opposite2'],
            });
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">🤖 Tra Cứu AI Từ Vựng</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <AILookupBox onSearch={handleSearch} isLoading={isLoading} result={result} />
                </div>

                {/* Tips */}
                <div className="bg-blue-50 rounded-xl shadow-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-blue-900 mb-4">💡 Mẹo sử dụng</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li>✅ Gõ từ tiếng Anh cần tra cứu</li>
                        <li>✅ AI sẽ cung cấp định nghĩa, ví dụ</li>
                        <li>✅ Nhấn &quot;Thêm vào Flashcard&quot; để lưu</li>
                        <li>✅ Từ sẽ được thêm vào collection hiện tại</li>
                    </ul>
                </div>
            </div>

            {/* Recent Searches */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🕐 Tìm kiếm gần đây</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['amazing', 'beautiful', 'courage', 'determination'].map((word) => (
                        <button
                            key={word}
                            onClick={() => handleSearch(word)}
                            className="p-3 bg-gray-100 rounded-lg hover:bg-blue-100 text-gray-700 font-semibold transition"
                        >
                            {word}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AILookupPage;
