'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const AvatarDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userName] = useState('Nguyễn Văn A');
    const [userEmail] = useState('user@example.com');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        if (window.confirm('Bạn chắc chắn muốn đăng xuất?')) {
            setIsOpen(false);
            // TODO: Clear auth token from localStorage/cookies
            router.push('/auth/login');
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold flex items-center justify-center hover:shadow-lg transition hover:scale-105 focus:outline-none"
                title={userName}
            >
                {getInitials(userName)}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                    {/* User Info */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-4 border-b">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg">
                                {getInitials(userName)}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-800 text-sm">{userName}</p>
                                <p className="text-gray-600 text-xs">{userEmail}</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        {/* Profile */}
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                alert('Chức năng Hồ sơ sẽ được cập nhật');
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition flex items-center gap-3"
                        >
                            <span className="text-lg">👤</span>
                            <span>Hồ sơ của tôi</span>
                        </button>

                        {/* My Flashcards */}
                        <Link
                            href="/flashcards"
                            onClick={() => setIsOpen(false)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition flex items-center gap-3 block"
                        >
                            <span className="text-lg">📚</span>
                            <span>Flashcard của tôi</span>
                        </Link>

                        {/* My Groups */}
                        <Link
                            href="/groups"
                            onClick={() => setIsOpen(false)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition flex items-center gap-3 block"
                        >
                            <span className="text-lg">👥</span>
                            <span>Nhóm học của tôi</span>
                        </Link>

                        {/* Statistics */}
                        <Link
                            href="/progress"
                            onClick={() => setIsOpen(false)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition flex items-center gap-3 block"
                        >
                            <span className="text-lg">📊</span>
                            <span>Thống kê học tập</span>
                        </Link>

                        <hr className="my-2" />

                        {/* Settings */}
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                alert('Chức năng Cài đặt sẽ được cập nhật');
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition flex items-center gap-3"
                        >
                            <span className="text-lg">⚙️</span>
                            <span>Cài đặt</span>
                        </button>

                        {/* Help */}
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                alert('Trung tâm trợ giúp sẽ được cập nhật');
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition flex items-center gap-3"
                        >
                            <span className="text-lg">❓</span>
                            <span>Trợ giúp & hỗ trợ</span>
                        </button>

                        <hr className="my-2" />

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-3 font-semibold"
                        >
                            <span className="text-lg">🚪</span>
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvatarDropdown;
