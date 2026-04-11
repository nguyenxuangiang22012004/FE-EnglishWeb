'use client';

import React from 'react';

interface FlashcardListProps {
    cards: Array<{
        id: string;
        word: string;
        meaning: string;
        isFavorite?: boolean;
        status?: 'unknown' | 'learning' | 'mastered';
    }>;
    onSelect?: (id: string) => void;
    onDelete?: (id: string) => void;
    onEdit?: (id: string) => void;
    selectedId?: string;
}

export const FlashcardList: React.FC<FlashcardListProps> = ({
    cards,
    onSelect,
    onDelete,
    onEdit,
    selectedId,
}) => {
    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'mastered':
                return 'bg-green-100 text-green-800 border-l-4 border-green-500';
            case 'learning':
                return 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500';
            default:
                return 'bg-red-100 text-red-800 border-l-4 border-red-500';
        }
    };

    const getStatusLabel = (status?: string) => {
        switch (status) {
            case 'mastered':
                return '✅ Thuộc';
            case 'learning':
                return '📚 Đang học';
            default:
                return '❌ Chưa biết';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">{cards.length} từ vựng</h3>
            </div>

            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {cards.map((card) => (
                    <div
                        key={card.id}
                        onClick={() => onSelect?.(card.id)}
                        className={`p-4 cursor-pointer transition ${getStatusColor(card.status)} ${selectedId === card.id ? 'ring-2 ring-blue-500' : ''
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{card.word}</p>
                                <p className="text-xs opacity-75 mt-1">{card.meaning}</p>
                            </div>
                            <div className="flex gap-2 ml-2">
                                {card.isFavorite && <span className="text-lg">⭐</span>}
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs font-semibold">{getStatusLabel(card.status)}</span>
                            <div className="flex gap-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit?.(card.id);
                                    }}
                                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete?.(card.id);
                                    }}
                                    className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FlashcardList;
