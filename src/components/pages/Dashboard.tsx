"use client";

import React, { useState, useEffect } from 'react';
import { ProgressChart } from '@/components/ui/ProgressChart';
import { dashboardService } from '@/services/dashboard';
import { DashboardResponseDTO, UpdateGoalsRequestDTO } from '@/types/dashboard';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardResponseDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [goalsForm, setGoalsForm] = useState<UpdateGoalsRequestDTO>({
        dailyWordsGoal: 10,
        totalWordsGoal: 200,
        streakGoal: 30
    });

    const fetchData = async () => {
        try {
            const res = await dashboardService.getDashboardData();
            setData(res);
            setGoalsForm({
                dailyWordsGoal: res.studyGoals.dailyWordsGoal,
                totalWordsGoal: res.studyGoals.totalWordsGoal,
                streakGoal: res.studyGoals.streakGoal
            });
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateGoals = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await dashboardService.updateStudyGoals(goalsForm);
            setData(res);
            setShowGoalModal(false);
            toast.success("Cập nhật mục tiêu thành công!");
        } catch (error) {
            console.error("Failed to update goals", error);
            toast.error("Lỗi khi cập nhật mục tiêu");
        }
    };

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="w-8 h-8 border-4 border-accent-indigo border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const statsConfig = [
        { label: 'Tổng từ vựng', value: data.stats.totalWords, icon: '📚', color: 'from-accent-indigo/20 to-accent-indigo/5', textColor: 'text-accent-indigo-light', borderColor: 'border-accent-indigo/20' },
        { label: 'Đã thuộc', value: data.stats.masteredWords, icon: '✅', color: 'from-accent-emerald/20 to-accent-emerald/5', textColor: 'text-accent-emerald', borderColor: 'border-accent-emerald/20' },
        { label: 'Chuỗi ngày liên tiếp', value: data.stats.consecutiveDays, icon: '🔥', color: 'from-amber-500/20 to-amber-500/5', textColor: 'text-accent-amber', borderColor: 'border-amber-500/20' },
        { label: 'Nhóm học', value: data.stats.studyGroups, icon: '👥', color: 'from-purple-500/20 to-purple-500/5', textColor: 'text-purple-400', borderColor: 'border-purple-500/20' },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-indigo/20 via-purple-600/15 to-accent-emerald/10 border border-white/[0.08] p-8 animate-fadeIn">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-indigo/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-emerald/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
                
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
                            👋 Chào mừng trở lại!
                        </h1>
                        <p className="text-slate-300/80 text-lg">
                            Hôm nay bạn học được bao nhiêu từ? 🚀
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowGoalModal(true)}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-white/10"
                    >
                        ⚙️ Cấu hình mục tiêu
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {statsConfig.map((stat, idx) => (
                    <div
                        key={stat.label}
                        className={`glass-card-hover p-5 border ${stat.borderColor} animate-fadeIn stagger-${idx + 1}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-medium mb-1.5">{stat.label}</p>
                                <p className={`text-2xl sm:text-3xl font-display font-bold ${stat.textColor}`}>{stat.value}</p>
                            </div>
                            <div className="text-3xl opacity-80">{stat.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress Section */}
            <div className="mt-8">
                <ProgressChart
                    totalWords={data.progressChart.totalWords}
                    mastered={data.progressChart.mastered}
                    learning={data.progressChart.learning}
                    unknown={data.progressChart.unknown}
                    weekStats={data.progressChart.weekStats}
                />
            </div>

            {/* Achievements and Study Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Achievements */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-display font-bold text-slate-200 mb-4">🏆 Thành tích</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3 gap-4">
                        <div className="bg-amber-500/10 rounded-xl p-5 border border-amber-500/20">
                            <div className="text-4xl mb-2">🔥</div>
                            <p className="font-display font-bold text-slate-200">{data.achievements.consecutiveDays} ngày</p>
                            <p className="text-sm text-slate-400 mt-1">Đã học tập</p>
                        </div>

                        <div className="bg-purple-500/10 rounded-xl p-5 border border-purple-500/20">
                            <div className="text-4xl mb-2">⭐</div>
                            <p className="font-display font-bold text-slate-200">{data.achievements.totalWordsLearned}+ từ</p>
                            <p className="text-sm text-slate-400 mt-1">Đã học tổng</p>
                        </div>

                        <div className="bg-accent-indigo/10 rounded-xl p-5 border border-accent-indigo/20">
                            <div className="text-4xl mb-2">🎯</div>
                            <p className="font-display font-bold text-slate-200">{data.achievements.quickSearchAccuracy}%</p>
                            <p className="text-sm text-slate-400 mt-1">Tìm nhanh</p>
                        </div>
                    </div>
                </div>

                {/* Study Goals */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-display font-bold text-slate-200 mb-4">🎯 Mục tiêu học tập</h2>
                    <div className="space-y-5">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-medium text-slate-200">Học {data.studyGoals.dailyWordsGoal} từ mỗi ngày</p>
                                <span className="text-sm text-slate-400">{data.studyGoals.dailyWordsLearned}/{data.studyGoals.dailyWordsGoal}</span>
                            </div>
                            <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-accent-indigo to-accent-indigo-light rounded-full shimmer-bar" style={{ width: `${Math.min(100, (data.studyGoals.dailyWordsLearned / data.studyGoals.dailyWordsGoal) * 100)}%` }} />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-medium text-slate-200">Thuộc {data.studyGoals.totalWordsGoal} từ</p>
                                <span className="text-sm text-slate-400">{data.studyGoals.totalWordsLearned}/{data.studyGoals.totalWordsGoal}</span>
                            </div>
                            <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-accent-emerald to-accent-cyan rounded-full shimmer-bar" style={{ width: `${Math.min(100, (data.studyGoals.totalWordsLearned / data.studyGoals.totalWordsGoal) * 100)}%` }} />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-medium text-slate-200">Học {data.studyGoals.streakGoal} ngày liên tiếp</p>
                                <span className="text-sm text-slate-400">{data.studyGoals.currentStreak}/{data.studyGoals.streakGoal}</span>
                            </div>
                            <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-accent-amber to-orange-500 rounded-full shimmer-bar" style={{ width: `${Math.min(100, (data.studyGoals.currentStreak / data.studyGoals.streakGoal) * 100)}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Goal Modal */}
            {showGoalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="glass-card w-full max-w-md p-6 m-4 relative animate-scaleIn">
                        <button 
                            onClick={() => setShowGoalModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                        <h3 className="text-2xl font-display font-bold text-white mb-6">Cấu hình mục tiêu</h3>
                        <form onSubmit={handleUpdateGoals} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Mục tiêu từ vựng mỗi ngày</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={goalsForm.dailyWordsGoal}
                                    onChange={(e) => setGoalsForm({...goalsForm, dailyWordsGoal: parseInt(e.target.value) || 0})}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-indigo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Mục tiêu tổng số từ cần thuộc</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={goalsForm.totalWordsGoal}
                                    onChange={(e) => setGoalsForm({...goalsForm, totalWordsGoal: parseInt(e.target.value) || 0})}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-indigo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Mục tiêu chuỗi ngày học liên tiếp</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={goalsForm.streakGoal}
                                    onChange={(e) => setGoalsForm({...goalsForm, streakGoal: parseInt(e.target.value) || 0})}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-indigo"
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowGoalModal(false)}
                                    className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-accent-indigo hover:bg-accent-indigo-light text-white font-medium transition-colors"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
