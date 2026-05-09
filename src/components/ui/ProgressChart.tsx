

import React from 'react';

interface ProgressChartProps { totalWords: number; mastered: number; learning: number; unknown: number; weekStats?: { day: string; count: number }[]; }

export const ProgressChart: React.FC<ProgressChartProps> = ({ totalWords, mastered, learning, unknown, weekStats }) => {
    const masteredPercent = (mastered / totalWords) * 100 || 0;
    const learningPercent = (learning / totalWords) * 100 || 0;
    const unknownPercent = (unknown / totalWords) * 100 || 0;

    return (
        <div className="glass-card p-6">
            <h2 className="text-xl font-display font-bold text-slate-200 mb-6">📊 Tiến độ học tập</h2>
            <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-accent-indigo/10 rounded-xl p-4 text-center border border-accent-indigo/15">
                    <p className="text-slate-400 text-xs mb-1">Tổng từ</p>
                    <p className="text-2xl font-display font-bold text-accent-indigo-light">{totalWords}</p>
                </div>
                <div className="bg-accent-emerald/10 rounded-xl p-4 text-center border border-accent-emerald/15">
                    <p className="text-slate-400 text-xs mb-1">✅ Thuộc</p>
                    <p className="text-2xl font-display font-bold text-accent-emerald">{mastered}</p>
                </div>
                <div className="bg-accent-amber/10 rounded-xl p-4 text-center border border-accent-amber/15">
                    <p className="text-slate-400 text-xs mb-1">📚 Đang học</p>
                    <p className="text-2xl font-display font-bold text-accent-amber">{learning}</p>
                </div>
                <div className="bg-accent-rose/10 rounded-xl p-4 text-center border border-accent-rose/15">
                    <p className="text-slate-400 text-xs mb-1">❌ Chưa biết</p>
                    <p className="text-2xl font-display font-bold text-accent-rose">{unknown}</p>
                </div>
            </div>

            <div className="mb-6">
                <p className="text-sm font-medium text-slate-300 mb-2">Tỉ lệ hoàn thành:</p>
                <div className="flex gap-0.5 h-3 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-accent-emerald to-accent-emerald-light transition-all rounded-l-full" style={{ width: `${masteredPercent}%` }} title={`Thuộc: ${mastered}`} />
                    <div className="bg-gradient-to-r from-accent-amber to-yellow-400 transition-all" style={{ width: `${learningPercent}%` }} title={`Đang học: ${learning}`} />
                    <div className="bg-gradient-to-r from-accent-rose to-red-400 transition-all rounded-r-full" style={{ width: `${unknownPercent}%` }} title={`Chưa biết: ${unknown}`} />
                </div>
            </div>

            {weekStats && weekStats.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-slate-300 mb-3">Hoạt động tuần này:</p>
                    <div className="flex items-end justify-around h-32 bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                        {weekStats.map((stat, idx) => (
                            <div key={idx} className="text-center group">
                                <div className="w-8 bg-gradient-to-t from-accent-indigo to-accent-indigo-light rounded-t-lg transition-all group-hover:shadow-lg group-hover:shadow-accent-indigo/30" style={{ height: `${(stat.count / Math.max(...weekStats.map(s => s.count))) * 100}px` }} />
                                <p className="text-xs text-slate-500 mt-2">{stat.day}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressChart;
