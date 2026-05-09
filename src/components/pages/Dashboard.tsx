

import React from 'react';
import Link from 'next/link';

const stats = [
    { label: 'Tổng từ vựng', value: '245', icon: '📚', color: 'from-accent-indigo/20 to-accent-indigo/5', textColor: 'text-accent-indigo-light', borderColor: 'border-accent-indigo/20' },
    { label: 'Đã thuộc', value: '156', icon: '✅', color: 'from-accent-emerald/20 to-accent-emerald/5', textColor: 'text-accent-emerald', borderColor: 'border-accent-emerald/20' },
    { label: 'Chuỗi ngày liên tiếp', value: '12', icon: '🔥', color: 'from-amber-500/20 to-amber-500/5', textColor: 'text-accent-amber', borderColor: 'border-amber-500/20' },
    { label: 'Nhóm học', value: '5', icon: '👥', color: 'from-purple-500/20 to-purple-500/5', textColor: 'text-purple-400', borderColor: 'border-purple-500/20' },
];

const quickActions = [
    { href: '/create', icon: '➕', title: 'Tạo Flashcard', desc: 'Thêm từ vựng mới', gradient: 'from-accent-indigo/10 to-purple-500/10', hoverBorder: 'hover:border-accent-indigo/30' },
    { href: '/import', icon: '📁', title: 'Import Dữ Liệu', desc: 'Paste từ ChatGPT', gradient: 'from-accent-emerald/10 to-cyan-500/10', hoverBorder: 'hover:border-accent-emerald/30' },
    { href: '/ai-lookup', icon: '🤖', title: 'Tra Cứu AI', desc: 'Tìm từ nhanh', gradient: 'from-accent-amber/10 to-orange-500/10', hoverBorder: 'hover:border-accent-amber/30' },
];

export const Dashboard: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-indigo/20 via-purple-600/15 to-accent-emerald/10 border border-white/[0.08] p-8 animate-fadeIn">
                {/* Decorative orbs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-indigo/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-emerald/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
                
                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
                        👋 Chào mừng trở lại!
                    </h1>
                    <p className="text-slate-300/80 text-lg">
                        Hôm nay bạn học được bao nhiêu từ? 🚀
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {stats.map((stat, idx) => (
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

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-display font-bold text-slate-200 mb-4 animate-fadeIn stagger-5">
                    ⚡ Hành động nhanh
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    {quickActions.map((action, idx) => (
                        <Link key={action.href} href={action.href}>
                            <div className={`glass-card-hover p-6 cursor-pointer bg-gradient-to-br ${action.gradient} ${action.hoverBorder} animate-fadeIn stagger-${idx + 5}`}>
                                <div className="text-3xl mb-3">{action.icon}</div>
                                <h3 className="font-display font-bold text-slate-200 mb-1">{action.title}</h3>
                                <p className="text-sm text-slate-400">{action.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Study */}
            <div>
                <h2 className="text-xl font-display font-bold text-slate-200 mb-4 animate-fadeIn">
                    📖 Bộ sưu tập gần đây
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    {[1, 2, 3].map((idx) => (
                        <div key={idx} className="glass-card-hover p-5 cursor-pointer animate-fadeIn">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-display font-bold text-slate-200">Business English</h3>
                                <span className="text-xs bg-accent-indigo/20 text-accent-indigo-light px-2.5 py-1 rounded-lg font-medium">
                                    45 từ
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 mb-4">Từ vựng kinh tế</p>
                            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-accent-indigo to-accent-emerald rounded-full shimmer-bar" style={{ width: '60%' }} />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">27/45 từ đã thuộc</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
