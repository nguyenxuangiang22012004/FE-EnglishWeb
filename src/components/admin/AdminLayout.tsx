'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Layers,
  FileText,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/slices/authSlice';
import authService from '@/services/authService';

const adminNavItems = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: <LayoutDashboard size={18} />,
    exact: true,
  },
  {
    href: '/admin/users',
    label: 'Quản lý Người dùng',
    icon: <Users size={18} />,
  },
  {
    href: '/admin/courses',
    label: 'Quản lý Khóa học',
    icon: <BookOpen size={18} />,
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = () => {
    authService.logout();
    dispatch(logout());
    router.push('/auth/login');
  };

  const Sidebar = () => (
    <aside className="w-64 flex-shrink-0 h-full flex flex-col bg-surface-900 border-r border-white/[0.06]">
      {/* Logo */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-white">Admin Panel</p>
          <p className="text-[11px] text-slate-500">Hệ thống quản trị</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-3">
          Quản Trị
        </p>
        {adminNavItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-[14px] group ${
                active
                  ? 'bg-red-500/15 text-red-400 shadow-sm'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <span className={active ? 'text-red-400' : 'text-slate-500 group-hover:text-slate-300'}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom — User + Logout */}
      <div className="p-4 border-t border-white/[0.06] space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-200 truncate">{user?.name || 'Admin'}</p>
            <p className="text-[11px] text-red-400 font-medium">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-[13px] font-medium"
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
        <Link
          href="/dashboard"
          className="block text-center text-[12px] text-slate-500 hover:text-slate-300 transition-colors py-1"
        >
          ← Về trang học tập
        </Link>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 z-50 w-64 md:hidden transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06] bg-surface-900/80 backdrop-blur-md flex-shrink-0">
          <button
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-red-400" />
            <span className="text-slate-300 text-sm font-medium">Admin Dashboard</span>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">
            HELLOENGLISH — Hệ thống quản trị
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
