// components/ui/FlashcardSetList.tsx
'use client';

import React from 'react';
import { FlashcardSet } from '@/store/slices/flashcardSlice';

interface FlashcardSetListProps {
  sets: FlashcardSet[];
  onSelect: (setId: string) => void;
}

const getProgressStats = (cards: FlashcardSet['cards']) => {
  const total = cards.length;
  const mastered = cards.filter((c) => c.status === 'mastered').length;
  const learning = cards.filter((c) => c.status === 'learning').length;
  const unknown = total - mastered - learning;
  const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;
  return { total, mastered, learning, unknown, percent };
};

export const FlashcardSetList: React.FC<FlashcardSetListProps> = ({ sets, onSelect }) => {
  if (sets.length === 0) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">📭</div>
        <h2 className="text-2xl font-bold text-yellow-900 mb-2">Chưa có bộ flashcard nào</h2>
        <p className="text-yellow-700">Hãy tạo bộ flashcard đầu tiên để bắt đầu học!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sets.map((set) => {
        const { total, mastered, learning, unknown, percent } = getProgressStats(set.cards);

        return (
          <button
            key={set.id}
            onClick={() => onSelect(set.id)}
            className="text-left bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 p-5 border border-gray-100 group"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{set.emoji ?? '📦'}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                  {set.name}
                </h3>
                {set.description && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">{set.description}</p>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* Stats */}
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-500">{total} từ</span>
              <div className="flex gap-2">
                <span className="text-green-600">✅ {mastered}</span>
                <span className="text-yellow-600">📖 {learning}</span>
                <span className="text-red-500">❌ {unknown}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-3 text-center text-xs text-blue-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Học ngay →
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default FlashcardSetList;