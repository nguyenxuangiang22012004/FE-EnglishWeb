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
            <h1 className="text-3xl font-display font-bold text-slate-100">🤖 Tra Cứu AI Từ Vựng</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <AILookupBox onSearch={handleSearch} isLoading={isLoading} result={result} />
                </div>

                {/* Tips */}
                <div className="glass-card p-6 border border-accent-indigo/20 bg-gradient-to-br from-accent-indigo/5 to-transparent h-fit">
                    <h3 className="text-lg font-display font-bold text-accent-indigo-light mb-4">💡 Mẹo sử dụng</h3>
                    <ul className="space-y-2.5 text-sm text-slate-300">
                        <li className="flex items-start gap-2"><span className="text-accent-emerald mt-0.5">✦</span> Gõ từ tiếng Anh cần tra cứu</li>
                        <li className="flex items-start gap-2"><span className="text-accent-emerald mt-0.5">✦</span> AI sẽ cung cấp định nghĩa, ví dụ</li>
                        <li className="flex items-start gap-2"><span className="text-accent-emerald mt-0.5">✦</span> Nhấn &quot;Thêm vào Flashcard&quot; để lưu</li>
                        <li className="flex items-start gap-2"><span className="text-accent-emerald mt-0.5">✦</span> Từ sẽ được thêm vào collection hiện tại</li>
                    </ul>
                </div>
            </div>

            {/* Recent Searches */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-display font-bold text-slate-200 mb-4">🕐 Tìm kiếm gần đây</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['amazing', 'beautiful', 'courage', 'determination'].map((word) => (
                        <button
                            key={word}
                            onClick={() => handleSearch(word)}
                            className="p-3 bg-white/[0.04] border border-white/[0.06] rounded-xl hover:bg-white/[0.08] hover:border-accent-indigo/20 text-slate-300 font-medium transition-all text-sm"
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
