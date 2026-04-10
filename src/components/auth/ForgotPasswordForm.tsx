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
            // const response = await fetch('/api/auth/forgot-password', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(formData),
            // });

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">🎓 Học Tiếng Anh</h1>
                    <p className="text-gray-600">Đặt lại mật khẩu</p>
                </div>

                {/* Description */}
                <p className="text-center text-gray-600 mb-6 text-sm">
                    Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
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
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '⏳ Đang xử lý...' : '📤 Gửi Email Đặt Lại'}
                    </button>
                </form>

                {/* Divider */}
                <div className="my-6 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Quay lại</span>
                    </div>
                </div>

                {/* Login & Signup Links */}
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href="/auth/login"
                        className="text-center py-3 border-2 border-blue-500 text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition"
                    >
                        🔐 Đăng Nhập
                    </Link>
                    <Link
                        href="/auth/signup"
                        className="text-center py-3 border-2 border-green-500 text-green-600 rounded-lg font-bold hover:bg-green-50 transition"
                    >
                        📝 Đăng Ký
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500 mt-6">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;
