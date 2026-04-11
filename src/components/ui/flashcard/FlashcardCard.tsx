'use client';

import React, { useState } from 'react';

interface FlashcardProps {
    word: string;
    meaning: string;
    pronunciation?: string;
    example?: string;
    image?: string;
    isFavorite?: boolean;
    isFlipped?: boolean;
    onFlip?: () => void;
    onFavorite?: () => void;
    onPlaySound?: () => void;
}

export const FlashcardCard: React.FC<FlashcardProps> = ({
    word,
    meaning,
    pronunciation,
    example,
    image,
    isFavorite = false,
    isFlipped = false,
    onFlip,
    onFavorite,
    onPlaySound,
}) => {
    return (
        <div className="flex items-center justify-center w-full">
            {/* Scene container - tạo perspective cho 3D */}
            <div
                className="w-full max-w-sm h-64 cursor-pointer"
                style={{ perspective: '1000px' }}
                onClick={onFlip}
            >
                {/* Card inner - phần xoay */}
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)',
                        transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                    }}
                >
                    {/* Mặt trước */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 flex flex-col justify-between"
                        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-white text-2xl font-bold">{word}</h3>
                                {pronunciation && (
                                    <p className="text-blue-100 text-sm mt-1">{pronunciation}</p>
                                )}
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); onFavorite?.(); }}
                                className={`text-2xl transition ${isFavorite ? 'text-yellow-300' : 'text-white/50'}`}
                            >
                                ⭐
                            </button>
                        </div>

                        {image && (
                            <div className="w-full h-20 bg-white/20 rounded mb-2 flex items-center justify-center text-white/70 text-sm">
                                [Hình ảnh]
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <span className="text-white text-xs opacity-75">👆 Click để xem nghĩa</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); onPlaySound?.(); }}
                                className="text-white text-xl hover:scale-110 transition"
                            >
                                🔊
                            </button>
                        </div>
                    </div>

                    {/* Mặt sau */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 flex flex-col justify-between"
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                        }}
                    >
                        <div className="flex justify-between items-start">
                            <h3 className="text-white text-2xl font-bold">{meaning}</h3>
                            <button
                                onClick={(e) => { e.stopPropagation(); onFavorite?.(); }}
                                className={`text-2xl transition ${isFavorite ? 'text-yellow-300' : 'text-white/50'}`}
                            >
                                ⭐
                            </button>
                        </div>

                        {example && (
                            <p className="text-blue-100 italic text-sm">
                                <span className="font-semibold not-italic">Ví dụ:</span> {example}
                            </p>
                        )}

                        <div className="text-white text-xs opacity-75">
                            👇 Click để xem từ
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlashcardCard;