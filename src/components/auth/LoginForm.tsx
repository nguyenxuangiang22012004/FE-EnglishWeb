'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/store';
import authService from '@/services/authService';
import { setToken, setUser } from '@/store/slices/authSlice';
import { getUserFromToken } from '@/utils/auth';
import axios from 'axios';

interface LoginFormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

export const LoginForm: React.FC = () => {
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();

    const getLoginErrorMessage = (err: unknown): string => {
        if (axios.isAxiosError(err)) {
            const data = err.response?.data as { message?: string; error?: string };
            if (typeof data?.message === 'string') return data.message;
            if (typeof data?.error === 'string') return data.error;
        }
        return 'Lỗi đăng nhập. Vui lòng thử lại.';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate form
            if (!formData.email || !formData.password) {
                setError('Vui lòng nhập email và mật khẩu');
                setLoading(false);
                return;
            }

            // Call login API
            const response = await authService.login({
                email: formData.email.trim(),
                password: formData.password,
            });

            // Store token and user info
            if (response.success && response.data.accessToken) {
                const token = response.data.accessToken;
                localStorage.setItem('token', token);
                dispatch(setToken(token));

                // Extract user info from token or response
                const userFromToken = getUserFromToken(token);
                const user = response.data.user || userFromToken;

                if (user) {
                    dispatch(setUser(user));
                }

                // Redirect to the original page or dashboard
                const redirectTo = searchParams.get('redirect') || '/dashboard';
                router.push(redirectTo);
            } else if (response.message) {
                setError(response.message);
            }
        } catch (err) {
            setError(getLoginErrorMessage(err));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-900 mesh-bg flex items-center justify-center px-4 py-12 relative">
            {/* Decorative blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-indigo/8 rounded-full blur-[120px] animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-emerald/6 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />

            <div className="glass-card p-8 w-full max-w-md relative z-10 animate-fadeInScale">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-indigo to-accent-emerald flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-accent-indigo/20">
                        🎓
                    </div>
                    <h1 className="text-3xl font-display font-bold gradient-text mb-2">Học Tiếng Anh</h1>
                    <p className="text-slate-400">Đăng nhập để tiếp tục</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            📧 Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 glass-input"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            🔐 Mật khẩu
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 glass-input"
                        />
                    </div>

                    {/* Remember & Forgot */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                className="w-4 h-4 rounded bg-white/5 border-white/10 text-accent-indigo focus:ring-accent-indigo/30"
                            />
                            <span className="text-sm text-slate-400">Nhớ tôi</span>
                        </label>
                        <Link
                            href="/auth/forgot-password"
                            className="text-sm text-accent-indigo-light hover:text-accent-indigo font-medium transition-colors"
                        >
                            Quên mật khẩu?
                        </Link>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-accent-rose/10 border border-accent-rose/20 text-accent-rose px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-accent-indigo to-accent-indigo-light text-white rounded-xl font-bold glow-btn disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide"
                    >
                        {loading ? '⏳ Đang xử lý...' : '✅ Đăng Nhập'}
                    </button>
                </form>

                {/* Divider */}
                <div className="my-6 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/[0.06]"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-surface-800/80 text-slate-500 text-xs">Chưa có tài khoản?</span>
                    </div>
                </div>

                {/* Sign Up Link */}
                <Link
                    href="/auth/signup"
                    className="block text-center py-3 border border-accent-indigo/30 text-accent-indigo-light rounded-xl font-bold hover:bg-accent-indigo/5 transition-all text-sm"
                >
                    📝 Tạo Tài Khoản Mới
                </Link>

                {/* Footer */}
                <p className="text-center text-xs text-slate-600 mt-6">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
