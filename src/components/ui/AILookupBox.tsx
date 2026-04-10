'use client';

import React, { useState } from 'react';

interface AILookupBoxProps {
    onSearch?: (word: string) => void;
    isLoading?: boolean;
    result?: {
        word: string;
        meaning: string;
        pronunciation?: string;
        wordType?: string;
        examples?: string[];
        synonyms?: string[];
        antonyms?: string[];
    };
}

export const AILookupBox: React.FC<AILookupBoxProps> = ({ onSearch, isLoading, result }) => {
    const [searchWord, setSearchWord] = useState('');

    const handleSearch = () => {
        if (searchWord.trim()) {
            onSearch?.(searchWord);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Search Box */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🤖 Tra cứu từ vựng bằng AI
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={searchWord}
                        onChange={(e) => setSearchWord(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Nhập từ tiếng Anh..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {isLoading ? '⏳ Tìm kiếm...' : '🔍 Tra cứu'}
                    </button>
                </div>
            </div>

            {/* Result */}
            {result && (
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div className="mb-4">
                        <h3 className="text-2xl font-bold text-blue-600">{result.word}</h3>
                        {result.pronunciation && (
                            <p className="text-gray-600 text-sm italic">/{result.pronunciation}/</p>
                        )}
                        {result.wordType && (
                            <span className="inline-block mt-2 px-3 py-1 bg-blue-200 text-blue-800 rounded text-sm font-semibold">
                                {result.wordType}
                            </span>
                        )}
                    </div>

                    <div className="mb-4 pb-4 border-b border-blue-200">
                        <p className="text-gray-800">
                            <span className="font-semibold">Nghĩa:</span> {result.meaning}
                        </p>
                    </div>

                    {result.examples && result.examples.length > 0 && (
                        <div className="mb-4 pb-4 border-b border-blue-200">
                            <p className="font-semibold text-gray-800 mb-2">Ví dụ:</p>
                            <ul className="space-y-2">
                                {result.examples.map((ex, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 italic">
                                        • {ex}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {result.synonyms && result.synonyms.length > 0 && (
                            <div>
                                <p className="font-semibold text-gray-800 mb-2">Từ đồng nghĩa:</p>
                                <p className="text-sm text-gray-700">{result.synonyms.join(', ')}</p>
                            </div>
                        )}
                        {result.antonyms && result.antonyms.length > 0 && (
                            <div>
                                <p className="font-semibold text-gray-800 mb-2">Từ trái nghĩa:</p>
                                <p className="text-sm text-gray-700">{result.antonyms.join(', ')}</p>
                            </div>
                        )}
                    </div>

                    <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                        ➕ Thêm vào Flashcard
                    </button>
                </div>
            )}
        </div>
    );
};

export default AILookupBox;
