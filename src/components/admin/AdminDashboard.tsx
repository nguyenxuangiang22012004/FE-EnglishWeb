'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  BookOpen,
  Layers,
  TrendingUp,
  UserPlus,
  Activity,
  Crown,
  Clock,
} from 'lucide-react';
import adminService from '@/services/adminService';
import { AdminStatsDTO } from '@/types/admin';

// ─── Stat Card ─────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, gradient, subtitle }) => (
  <div className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-surface-800/60 backdrop-blur p-6 group hover:border-white/10 transition-all duration-300`}>
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradient}`} />
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <TrendingUp size={16} className="text-slate-600" />
      </div>
      <p className="text-3xl font-bold text-white mb-1">
        {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
      </p>
      <p className="text-sm text-slate-400 font-medium">{label}</p>
      {subtitle && <p className="text-xs text-slate-600 mt-1">{subtitle}</p>}
    </div>
  </div>
);

// ─── Role Badge ─────────────────────────────────────────────────────────────
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const map: Record<string, { label: string; cls: string }> = {
    ADMIN: { label: 'Admin', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
    USER: { label: 'Người dùng', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    TEACHER: { label: 'Giáo viên', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  };
  const r = map[role?.toUpperCase()] || map['USER'];
  return (
    <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-semibold ${r.cls}`}>
      {r.label}
    </span>
  );
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService
      .getStats()
      .then(setStats)
      .catch(() => setError('Không thể tải dữ liệu thống kê'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 mb-2">{error || 'Lỗi không xác định'}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-slate-400 hover:text-white underline"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const statCards: StatCardProps[] = [
    {
      label: 'Tổng người dùng',
      value: stats.totalUsers,
      icon: <Users size={22} className="text-blue-400" />,
      color: 'bg-blue-500/15',
      gradient: 'bg-gradient-to-br from-blue-500/5 to-transparent',
      subtitle: `+${stats.newUsersToday} người mới hôm nay`,
    },
    {
      label: 'Tổng khóa học',
      value: stats.totalCourses,
      icon: <BookOpen size={22} className="text-emerald-400" />,
      color: 'bg-emerald-500/15',
      gradient: 'bg-gradient-to-br from-emerald-500/5 to-transparent',
    },
    {
      label: 'Bộ Flashcard',
      value: stats.totalFlashcardSets,
      icon: <Layers size={22} className="text-purple-400" />,
      color: 'bg-purple-500/15',
      gradient: 'bg-gradient-to-br from-purple-500/5 to-transparent',
    },
    {
      label: 'Người dùng mới hôm nay',
      value: stats.newUsersToday,
      icon: <UserPlus size={22} className="text-orange-400" />,
      color: 'bg-orange-500/15',
      gradient: 'bg-gradient-to-br from-orange-500/5 to-transparent',
    },
    {
      label: 'Hoạt động hôm nay',
      value: stats.activeUsersToday,
      icon: <Activity size={22} className="text-pink-400" />,
      color: 'bg-pink-500/15',
      gradient: 'bg-gradient-to-br from-pink-500/5 to-transparent',
      subtitle: 'Người dùng học hôm nay',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Crown size={24} className="text-red-400" />
          Dashboard Quản Trị
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Tổng quan hệ thống HELLOENGLISH
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* Recent Users Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-surface-800/60 backdrop-blur overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            Người dùng đăng ký gần đây
          </h2>
          <a
            href="/admin/users"
            className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            Xem tất cả →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Quyền
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Ngày đăng ký
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {stats.recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                    Chưa có người dùng nào
                  </td>
                </tr>
              ) : (
                stats.recentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-indigo to-accent-emerald flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-medium text-slate-200">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
