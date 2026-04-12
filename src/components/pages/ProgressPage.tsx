

import React from 'react';
import { ProgressChart } from '@/components/ui/ProgressChart';

export const ProgressPage: React.FC = () => {
    const mockStats = [
        { day: 'Thứ 2', count: 15 },
        { day: 'Thứ 3', count: 22 },
        { day: 'Thứ 4', count: 18 },
        { day: 'Thứ 5', count: 30 },
        { day: 'Thứ 6', count: 25 },
        { day: 'Thứ 7', count: 28 },
        { day: 'CN', count: 20 },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">📊 Thống kê tiến độ</h1>

            <ProgressChart
                totalWords={245}
                mastered={156}
                learning={62}
                unknown={27}
                weekStats={mockStats}
            />

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Thành tích</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-yellow-50 rounded-lg p-4 border-b-4 border-yellow-400">
                        <div className="text-4xl mb-2">🔥</div>
                        <p className="font-semibold text-gray-800">12 ngày liên tiếp</p>
                        <p className="text-sm text-gray-600">Đã học tập hàng ngày</p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4 border-b-4 border-purple-400">
                        <div className="text-4xl mb-2">⭐</div>
                        <p className="font-semibold text-gray-800">500+ từ</p>
                        <p className="text-sm text-gray-600">Đã học tổng cộng</p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 border-b-4 border-blue-400">
                        <div className="text-4xl mb-2">🎯</div>
                        <p className="font-semibold text-gray-800">64%</p>
                        <p className="text-sm text-gray-600">Tìm từ nhanh</p>
                    </div>
                </div>
            </div>

            {/* Study Goals */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Mục tiêu học tập</h2>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-semibold text-gray-800">Học 10 từ mỗi ngày</p>
                            <span className="text-sm text-gray-600">8/10</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: '80%' }} />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-semibold text-gray-800">Thuộc 200 từ</p>
                            <span className="text-sm text-gray-600">156/200</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: '78%' }} />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-semibold text-gray-800">Học 30 ngày liên tiếp</p>
                            <span className="text-sm text-gray-600">12/30</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500" style={{ width: '40%' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressPage;
