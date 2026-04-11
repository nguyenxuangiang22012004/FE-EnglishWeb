import React from 'react';

interface ResultScreenProps {
    score: number;
    total: number;
    wrongCardIds: string[];
    setName: string;
    setEmoji: string;
    isRetryRound: boolean;
    onRetryAll: () => void;
    onRetryWrong: () => void;
    onBack: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
    score,
    total,
    wrongCardIds,
    setName,
    setEmoji,
    isRetryRound,
    onRetryAll,
    onRetryWrong,
    onBack,
}) => {
    const percent = Math.round((score / total) * 100);
    const wrongCount = wrongCardIds.length;

    const grade =
        percent >= 90
            ? { emoji: '🏆', label: 'Xuất sắc!', color: 'text-yellow-600 bg-yellow-50 border-yellow-300' }
            : percent >= 70
                ? { emoji: '🎉', label: 'Tốt lắm!', color: 'text-green-700 bg-green-50 border-green-300' }
                : percent >= 50
                    ? { emoji: '💪', label: 'Cố lên!', color: 'text-blue-700 bg-blue-50 border-blue-300' }
                    : { emoji: '📚', label: 'Cần ôn thêm', color: 'text-orange-700 bg-orange-50 border-orange-300' };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center space-y-6 mb-4">
                <div className="text-6xl">{grade.emoji}</div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">{grade.label}</h1>
                    <p className="text-gray-500 flex items-center justify-center gap-2">
                        {setEmoji} {setName}
                        {isRetryRound && (
                            <span className="text-xs font-semibold px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
                                Luyện lại câu sai
                            </span>
                        )}
                    </p>
                </div>

                {/* Score circle */}
                <div className="flex justify-center">
                    <div
                        className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center ${grade.color}`}
                    >
                        <span className="text-4xl font-bold">{percent}%</span>
                        <span className="text-sm font-medium">{score}/{total}</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-2xl font-bold text-green-600">{score}</p>
                        <p className="text-xs text-green-700">Đúng</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3">
                        <p className="text-2xl font-bold text-red-500">{wrongCount}</p>
                        <p className="text-xs text-red-600">Sai</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-2xl font-bold text-blue-600">{total}</p>
                        <p className="text-xs text-blue-700">Tổng</p>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={onRetryAll}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                    >
                        🔄 Làm lại toàn bộ
                    </button>

                    {wrongCount === 0 ? (
                        <div className="w-full py-3 border border-green-200 text-green-600 rounded-xl text-sm text-center bg-green-50 font-medium">
                            🎊 Không có câu sai nào!
                        </div>
                    ) : (
                        <button
                            onClick={onRetryWrong}
                            className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition"
                        >
                            ❌ Làm lại {wrongCount} câu sai
                        </button>
                    )}

                    <button
                        onClick={onBack}
                        className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                    >
                        ← Quay lại bộ từ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultScreen;
