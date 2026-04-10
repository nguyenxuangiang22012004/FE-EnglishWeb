'use client';

import React from 'react';

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
        <div
            className="w-full max-w-sm h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105"
            onClick={onFlip}
        >
            {/* Header với Star Button */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-white text-2xl font-bold">{isFlipped ? meaning : word}</h3>
                    {pronunciation && !isFlipped && (
                        <p className="text-blue-100 text-sm mt-1">{pronunciation}</p>
                    )}
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onFavorite?.();
                    }}
                    className={`text-2xl transition ${isFavorite ? 'text-yellow-300' : 'text-white/50'}`}
                >
                    ⭐
                </button>
            </div>

            {/* Nội dung chính */}
            <div className="flex-1">
                {image && !isFlipped && (
                    <div className="w-full h-32 bg-gray-300 rounded mb-3 flex items-center justify-center text-gray-600 text-sm">
                        [Hình ảnh]
                    </div>
                )}
                {example && isFlipped && (
                    <p className="text-blue-100 italic text-sm">
                        <span className="font-semibold">Ví dụ:</span> {example}
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-4">
                <div className="text-white text-xs opacity-75">
                    {isFlipped ? '👇 Click để xem từ' : '👆 Click để xem nghĩa'}
                </div>
                {!isFlipped && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onPlaySound?.();
                        }}
                        className="text-white text-xl hover:scale-110 transition"
                    >
                        🔊
                    </button>
                )}
            </div>
        </div>
    );
};

export default FlashcardCard;
