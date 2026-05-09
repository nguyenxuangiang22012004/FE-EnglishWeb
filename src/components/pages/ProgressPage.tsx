

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
            <h1 className="text-3xl font-display font-bold text-slate-100">📊 Thống kê tiến độ</h1>

            <ProgressChart
                totalWords={245}
                mastered={156}
                learning={62}
                unknown={27}
                weekStats={mockStats}
            />

            {/* Achievements */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-display font-bold text-slate-200 mb-4">🏆 Thành tích</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-amber-500/10 rounded-xl p-5 border border-amber-500/20">
                        <div className="text-4xl mb-2">🔥</div>
                        <p className="font-display font-bold text-slate-200">12 ngày liên tiếp</p>
                        <p className="text-sm text-slate-400 mt-1">Đã học tập hàng ngày</p>
                    </div>

                    <div className="bg-purple-500/10 rounded-xl p-5 border border-purple-500/20">
                        <div className="text-4xl mb-2">⭐</div>
                        <p className="font-display font-bold text-slate-200">500+ từ</p>
                        <p className="text-sm text-slate-400 mt-1">Đã học tổng cộng</p>
                    </div>

                    <div className="bg-accent-indigo/10 rounded-xl p-5 border border-accent-indigo/20">
                        <div className="text-4xl mb-2">🎯</div>
                        <p className="font-display font-bold text-slate-200">64%</p>
                        <p className="text-sm text-slate-400 mt-1">Tìm từ nhanh</p>
                    </div>
                </div>
            </div>

            {/* Study Goals */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-display font-bold text-slate-200 mb-4">🎯 Mục tiêu học tập</h2>
                <div className="space-y-5">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-medium text-slate-200">Học 10 từ mỗi ngày</p>
                            <span className="text-sm text-slate-400">8/10</span>
                        </div>
                        <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-accent-indigo to-accent-indigo-light rounded-full shimmer-bar" style={{ width: '80%' }} />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-medium text-slate-200">Thuộc 200 từ</p>
                            <span className="text-sm text-slate-400">156/200</span>
                        </div>
                        <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-accent-emerald to-accent-cyan rounded-full shimmer-bar" style={{ width: '78%' }} />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-medium text-slate-200">Học 30 ngày liên tiếp</p>
                            <span className="text-sm text-slate-400">12/30</span>
                        </div>
                        <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-accent-amber to-orange-500 rounded-full shimmer-bar" style={{ width: '40%' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressPage;
