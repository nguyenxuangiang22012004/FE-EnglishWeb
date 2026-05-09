'use client';

import React, { useState } from 'react';

interface AILookupBoxProps {
    onSearch?: (word: string) => void;
    isLoading?: boolean;
    result?: { word: string; meaning: string; pronunciation?: string; wordType?: string; examples?: string[]; synonyms?: string[]; antonyms?: string[]; };
}

export const AILookupBox: React.FC<AILookupBoxProps> = ({ onSearch, isLoading, result }) => {
    const [searchWord, setSearchWord] = useState('');
    const handleSearch = () => { if (searchWord.trim()) { onSearch?.(searchWord); } };

    return (
        <div className="glass-card p-6">
            <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-2">🤖 Tra cứu từ vựng bằng AI</label>
                <div className="flex gap-2">
                    <input type="text" value={searchWord} onChange={(e) => setSearchWord(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} placeholder="Nhập từ tiếng Anh..." className="flex-1 px-4 py-3 glass-input" />
                    <button onClick={handleSearch} disabled={isLoading} className="px-6 py-3 bg-gradient-to-r from-accent-indigo to-accent-indigo-light text-white rounded-xl font-semibold glow-btn disabled:opacity-50 text-sm">
                        {isLoading ? '⏳ Tìm...' : '🔍 Tra cứu'}
                    </button>
                </div>
            </div>

            {result && (
                <div className="glass-card p-5 border border-accent-indigo/20 bg-gradient-to-br from-accent-indigo/5 to-transparent animate-fadeIn">
                    <div className="mb-4">
                        <h3 className="text-2xl font-display font-bold text-accent-indigo-light">{result.word}</h3>
                        {result.pronunciation && <p className="text-slate-400 text-sm italic">/{result.pronunciation}/</p>}
                        {result.wordType && <span className="inline-block mt-2 px-3 py-1 bg-accent-indigo/20 text-accent-indigo-light rounded-lg text-sm font-medium">{result.wordType}</span>}
                    </div>
                    <div className="mb-4 pb-4 border-b border-white/[0.06]">
                        <p className="text-slate-200"><span className="font-semibold text-slate-300">Nghĩa:</span> {result.meaning}</p>
                    </div>
                    {result.examples && result.examples.length > 0 && (
                        <div className="mb-4 pb-4 border-b border-white/[0.06]">
                            <p className="font-semibold text-slate-300 mb-2">Ví dụ:</p>
                            <ul className="space-y-2">
                                {result.examples.map((ex, idx) => <li key={idx} className="text-sm text-slate-400 italic flex gap-2"><span className="text-accent-emerald">•</span>{ex}</li>)}
                            </ul>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {result.synonyms && result.synonyms.length > 0 && (
                            <div><p className="font-semibold text-slate-300 mb-2">Từ đồng nghĩa:</p><p className="text-sm text-slate-400">{result.synonyms.join(', ')}</p></div>
                        )}
                        {result.antonyms && result.antonyms.length > 0 && (
                            <div><p className="font-semibold text-slate-300 mb-2">Từ trái nghĩa:</p><p className="text-sm text-slate-400">{result.antonyms.join(', ')}</p></div>
                        )}
                    </div>
                    <button className="w-full py-2.5 bg-gradient-to-r from-accent-emerald to-accent-cyan text-white rounded-xl font-semibold glow-btn text-sm">➕ Thêm vào Flashcard</button>
                </div>
            )}
        </div>
    );
};

export default AILookupBox;
