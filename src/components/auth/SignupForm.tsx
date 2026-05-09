'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SignupFormData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeTerms: boolean;
}

export const SignupForm: React.FC = () => {
    const [formData, setFormData] = useState<SignupFormData>({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

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
        setSuccess('');

        try {
            // Validation
            if (!formData.fullName || !formData.email || !formData.password) {
                setError('Vui lòng điền đầy đủ thông tin');
                setLoading(false);
                return;
            }

            if (formData.password.length < 6) {
                setError('Mật khẩu phải có ít nhất 6 ký tự');
                setLoading(false);
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                setError('Mật khẩu xác nhận không khớp');
                setLoading(false);
                return;
            }

            if (!formData.agreeTerms) {
                setError('Vui lòng đồng ý với Điều khoản dịch vụ');
                setLoading(false);
                return;
            }

            // TODO: Call signup API
            console.log('Signup attempt:', formData);
            setSuccess('✅ Đăng ký thành công! Chuyển hướng đến đăng nhập...');

            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);
        } catch (err) {
            setError('Lỗi đăng ký. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-900 mesh-bg flex items-center justify-center px-4 py-12 relative">
            {/* Decorative blobs */}
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent-emerald/6 rounded-full blur-[120px] animate-float" />
            <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-accent-indigo/8 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />

            <div className="glass-card p-8 w-full max-w-md relative z-10 animate-fadeInScale">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-emerald to-accent-cyan flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-accent-emerald/20">
                        🎓
                    </div>
                    <h1 className="text-3xl font-display font-bold gradient-text mb-2">Học Tiếng Anh</h1>
                    <p className="text-slate-400">Tạo tài khoản mới</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            👤 Họ Tên
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Nguyễn Văn A"
                            className="w-full px-4 py-3 glass-input"
                        />
                    </div>

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
                        <p className="text-xs text-slate-500 mt-1.5">Ít nhất 6 ký tự</p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            🔐 Xác nhận mật khẩu
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 glass-input"
                        />
                    </div>

                    {/* Terms Checkbox */}
                    <label className="flex items-start gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="agreeTerms"
                            checked={formData.agreeTerms}
                            onChange={handleChange}
                            className="w-4 h-4 rounded mt-0.5 flex-shrink-0 bg-white/5 border-white/10 text-accent-indigo focus:ring-accent-indigo/30"
                        />
                        <span className="text-sm text-slate-400">
                            Tôi đồng ý với{' '}
                            <Link href="#" className="text-accent-indigo-light hover:text-accent-indigo font-medium transition-colors">
                                Điều khoản dịch vụ
                            </Link>{' '}
                            và{' '}
                            <Link href="#" className="text-accent-indigo-light hover:text-accent-indigo font-medium transition-colors">
                                Chính sách bảo mật
                            </Link>
                        </span>
                    </label>

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
                        className="w-full py-3.5 bg-gradient-to-r from-accent-emerald to-accent-cyan text-white rounded-xl font-bold glow-btn disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide"
                    >
                        {loading ? '⏳ Đang xử lý...' : '✅ Tạo Tài Khoản'}
                    </button>
                </form>

                {/* Divider */}
                <div className="my-6 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/[0.06]"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-surface-800/80 text-slate-500 text-xs">Đã có tài khoản?</span>
                    </div>
                </div>

                {/* Login Link */}
                <Link
                    href="/auth/login"
                    className="block text-center py-3 border border-accent-indigo/30 text-accent-indigo-light rounded-xl font-bold hover:bg-accent-indigo/5 transition-all text-sm"
                >
                    🔐 Đăng Nhập
                </Link>

                {/* Footer */}
                <p className="text-center text-xs text-slate-600 mt-6">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default SignupForm;
