

import React from 'react';

interface ProgressChartProps {
    totalWords: number;
    mastered: number;
    learning: number;
    unknown: number;
    weekStats?: { day: string; count: number }[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
    totalWords,
    mastered,
    learning,
    unknown,
    weekStats,
}) => {
    const masteredPercent = (mastered / totalWords) * 100 || 0;
    const learningPercent = (learning / totalWords) * 100 || 0;
    const unknownPercent = (unknown / totalWords) * 100 || 0;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Tiến độ học tập</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-gray-600 text-sm mb-1">Tổng từ</p>
                    <p className="text-2xl font-bold text-blue-600">{totalWords}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-gray-600 text-sm mb-1">✅ Thuộc</p>
                    <p className="text-2xl font-bold text-green-600">{mastered}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <p className="text-gray-600 text-sm mb-1">📚 Đang học</p>
                    <p className="text-2xl font-bold text-yellow-600">{learning}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-gray-600 text-sm mb-1">❌ Chưa biết</p>
                    <p className="text-2xl font-bold text-red-600">{unknown}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Tỉ lệ hoàn thành:</p>
                <div className="flex gap-1 h-8 bg-gray-200 rounded-lg overflow-hidden">
                    <div
                        className="bg-green-500 transition-all"
                        style={{ width: `${masteredPercent}%` }}
                        title={`Thuộc: ${mastered}`}
                    />
                    <div
                        className="bg-yellow-500 transition-all"
                        style={{ width: `${learningPercent}%` }}
                        title={`Đang học: ${learning}`}
                    />
                    <div
                        className="bg-red-500 transition-all"
                        style={{ width: `${unknownPercent}%` }}
                        title={`Chưa biết: ${unknown}`}
                    />
                </div>
            </div>

            {/* Weekly Stats */}
            {weekStats && weekStats.length > 0 && (
                <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Hoạt động tuần này:</p>
                    <div className="flex items-end justify-around h-32 bg-gray-50 rounded-lg p-4">
                        {weekStats.map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <div
                                    className="w-8 bg-blue-500 rounded-t-lg transition-all"
                                    style={{ height: `${(stat.count / Math.max(...weekStats.map(s => s.count))) * 100}px` }}
                                />
                                <p className="text-xs text-gray-600 mt-2">{stat.day}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressChart;
