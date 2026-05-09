'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ForgotPasswordFormData {
    email: string;
}

export const ForgotPasswordForm: React.FC = () => {
    const [formData, setFormData] = useState<ForgotPasswordFormData>({
        email: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (!formData.email) {
                setError('Vui lòng nhập email');
                setLoading(false);
                return;
            }

            // TODO: Call forgot password API
            console.log('Forgot password request:', formData);
            setSuccess(
                '✅ Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra inbox của bạn.'
            );

            // Clear form after success
            setFormData({ email: '' });
        } catch (err) {
            setError('Lỗi gửi email. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-900 mesh-bg flex items-center justify-center px-4 py-12 relative">
            {/* Decorative blobs */}
            <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-accent-amber/6 rounded-full blur-[120px] animate-float" />
            <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-accent-indigo/8 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />

            <div className="glass-card p-8 w-full max-w-md relative z-10 animate-fadeInScale">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-amber to-orange-500 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-accent-amber/20">
                        🎓
                    </div>
                    <h1 className="text-3xl font-display font-bold gradient-text mb-2">Học Tiếng Anh</h1>
                    <p className="text-slate-400">Đặt lại mật khẩu</p>
                </div>

                {/* Description */}
                <p className="text-center text-slate-400 mb-6 text-sm">
                    Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
                </p>

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

                    {/* Error Message */}
                    {error && (
                        <div className="bg-accent-rose/10 border border-accent-rose/20 text-accent-rose px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald px-4 py-3 rounded-xl text-sm">
                            {success}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-accent-amber to-orange-500 text-white rounded-xl font-bold glow-btn disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide"
                    >
                        {loading ? '⏳ Đang xử lý...' : '📤 Gửi Email Đặt Lại'}
                    </button>
                </form>

                {/* Divider */}
                <div className="my-6 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/[0.06]"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-surface-800/80 text-slate-500 text-xs">Quay lại</span>
                    </div>
                </div>

                {/* Login & Signup Links */}
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href="/auth/login"
                        className="text-center py-3 border border-accent-indigo/30 text-accent-indigo-light rounded-xl font-bold hover:bg-accent-indigo/5 transition-all text-sm"
                    >
                        🔐 Đăng Nhập
                    </Link>
                    <Link
                        href="/auth/signup"
                        className="text-center py-3 border border-accent-emerald/30 text-accent-emerald rounded-xl font-bold hover:bg-accent-emerald/5 transition-all text-sm"
                    >
                        📝 Đăng Ký
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-600 mt-6">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;
