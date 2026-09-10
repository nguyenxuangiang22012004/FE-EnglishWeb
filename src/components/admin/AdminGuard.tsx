'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';

/**
 * AdminGuard — Client-side double-check role ADMIN.
 * Middleware đã kiểm tra server-side, component này là lớp bảo vệ thứ 2.
 */
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    // Nếu không có token → chưa login
    if (!token && typeof window !== 'undefined') {
      const localToken = localStorage.getItem('token');
      if (!localToken) {
        router.replace('/auth/login?redirect=/admin');
        return;
      }
    }
    // Nếu đã có user nhưng không phải ADMIN → về dashboard
    if (user && user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, token, router]);

  // Nếu chưa xác định user, hiện loading
  if (!user) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-indigo/30 border-t-accent-indigo rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Đang xác thực quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
};

export default AdminGuard;
