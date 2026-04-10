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
            // const response = await fetch('/api/auth/signup', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(formData),
            // });

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">🎓 Học Tiếng Anh</h1>
                    <p className="text-gray-600">Tạo tài khoản mới</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            👤 Họ Tên
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Nguyễn Văn A"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            📧 Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            🔐 Mật khẩu
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                        />
                        <p className="text-xs text-gray-500 mt-1">Ít nhất 6 ký tự</p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            🔐 Xác nhận mật khẩu
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                        />
                    </div>

                    {/* Terms Checkbox */}
                    <label className="flex items-start gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="agreeTerms"
                            checked={formData.agreeTerms}
                            onChange={handleChange}
                            className="w-4 h-4 rounded mt-1 flex-shrink-0"
                        />
                        <span className="text-sm text-gray-700">
                            Tôi đồng ý với{' '}
                            <Link href="#" className="text-blue-600 hover:text-blue-800 font-semibold">
                                Điều khoản dịch vụ
                            </Link>{' '}
                            và{' '}
                            <Link href="#" className="text-blue-600 hover:text-blue-800 font-semibold">
                                Chính sách bảo mật
                            </Link>
                        </span>
                    </label>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg text-sm">
                            {success}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '⏳ Đang xử lý...' : '✅ Tạo Tài Khoản'}
                    </button>
                </form>

                {/* Divider */}
                <div className="my-6 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Đã có tài khoản?</span>
                    </div>
                </div>

                {/* Login Link */}
                <Link
                    href="/auth/login"
                    className="block text-center py-3 border-2 border-blue-500 text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition"
                >
                    🔐 Đăng Nhập
                </Link>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500 mt-6">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default SignupForm;
