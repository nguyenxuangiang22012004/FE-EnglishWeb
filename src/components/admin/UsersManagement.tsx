'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Users,
  ShieldAlert,
  GraduationCap,
  User as UserIcon,
} from 'lucide-react';
import adminService from '@/services/adminService';
import { AdminUserDTO } from '@/types/admin';

// ─── Role Badge ─────────────────────────────────────────────────────────────
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    ADMIN: {
      label: 'Admin',
      cls: 'bg-red-500/20 text-red-400 border-red-500/30',
      icon: <ShieldAlert size={11} />,
    },
    USER: {
      label: 'Người dùng',
      cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      icon: <UserIcon size={11} />,
    },
    TEACHER: {
      label: 'Giáo viên',
      cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: <GraduationCap size={11} />,
    },
  };
  const r = map[role?.toUpperCase()] || map['USER'];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-xs font-semibold ${r.cls}`}>
      {r.icon}
      {r.label}
    </span>
  );
};

// ─── Role Select ────────────────────────────────────────────────────────────
const RoleSelect: React.FC<{
  currentRole: string;
  userId: string;
  onChanged: (userId: string, newRole: string) => void;
}> = ({ currentRole, userId, onChanged }) => {
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    if (newRole === currentRole) return;
    setLoading(true);
    try {
      await adminService.updateUserRole(userId, newRole);
      onChanged(userId, newRole);
    } catch {
      alert('Không thể đổi role. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={currentRole?.toUpperCase()}
      onChange={handleChange}
      disabled={loading}
      className="bg-surface-800 border border-white/[0.08] text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:border-red-500/50 focus:outline-none transition-colors disabled:opacity-50 cursor-pointer"
    >
      <option value="USER">Người dùng</option>
      <option value="TEACHER">Giáo viên</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({ search: search || undefined, page, size: PAGE_SIZE });
      setUsers(data.content);
      setTotal(data.totalElements);
      setTotalPages(data.totalPages);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  };

  const handleRoleChanged = (userId: string, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa người dùng "${userName}"?`)) return;
    setDeletingId(userId);
    try {
      await adminService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTotal((prev) => prev - 1);
    } catch {
      alert('Không thể xóa người dùng. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users size={24} className="text-red-400" />
            Quản lý Người dùng
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Tổng cộng <span className="text-white font-semibold">{total.toLocaleString('vi-VN')}</span> người dùng
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 transition-all text-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-800/80 border border-white/[0.08] rounded-xl text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-red-500/40 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-medium transition-colors border border-red-500/20"
        >
          Tìm kiếm
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); setSearchInput(''); setPage(0); }}
            className="px-4 py-2.5 bg-surface-800/80 border border-white/[0.08] rounded-xl text-slate-400 text-sm hover:text-white transition-colors"
          >
            Xóa bộ lọc
          </button>
        )}
      </form>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-surface-800/60 backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Quyền
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Streak
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Đổi quyền
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-white/[0.05] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                    {search ? 'Không tìm thấy người dùng nào' : 'Chưa có người dùng nào'}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-indigo to-accent-emerald flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-medium text-slate-200 whitespace-nowrap">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      🔥 {user.currentStreak} ngày
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <RoleSelect
                        currentRole={user.role}
                        userId={user.id}
                        onChanged={handleRoleChanged}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        disabled={deletingId === user.id || user.role?.toUpperCase() === 'ADMIN'}
                        title={user.role?.toUpperCase() === 'ADMIN' ? 'Không thể xóa Admin' : 'Xóa người dùng'}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {deletingId === user.id ? (
                          <RefreshCw size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Trang {page + 1} / {totalPages} — {total.toLocaleString('vi-VN')} người dùng
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pageNum = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      pageNum === page
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;
