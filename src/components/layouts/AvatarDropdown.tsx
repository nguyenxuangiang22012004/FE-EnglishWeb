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

    const menuItems = [
        {
            label: 'Hồ sơ của tôi',
            icon: '👤',
            onClick: () => {
                setIsOpen(false);
                alert('Chức năng Hồ sơ sẽ được cập nhật');
            },
        },
        {
            label: 'Flashcard của tôi',
            icon: '📚',
            href: '/flashcards',
        },
        {
            label: 'Nhóm học của tôi',
            icon: '👥',
            href: '/groups',
        },
        {
            label: 'Thống kê học tập',
            icon: '📊',
            href: '/progress',
        },
    ];

    const secondaryItems = [
        {
            label: 'Cài đặt',
            icon: '⚙️',
            onClick: () => {
                setIsOpen(false);
                alert('Chức năng Cài đặt sẽ được cập nhật');
            },
        },
        {
            label: 'Trợ giúp & hỗ trợ',
            icon: '❓',
            onClick: () => {
                setIsOpen(false);
                alert('Trung tâm trợ giúp sẽ được cập nhật');
            },
        },
    ];

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 p-3 rounded-[14px] border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors text-left focus:outline-none"
                title={userName}
            >
                <div className="w-10 h-10 rounded-full bg-accent-cyan flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-inner">
                    {getInitials(userName)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-slate-100 truncate flex items-center justify-between">
                        {userName}
                        <svg className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-500 flex items-center justify-center">
                            <span className="text-[8px]">👤</span>
                        </div>
                        Miễn phí
                    </div>
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-full glass-card overflow-hidden animate-slideUp shadow-2xl shadow-black/40 z-50">
                    {/* User Info */}
                    <div className="px-4 py-4 border-b border-white/[0.06] bg-gradient-to-r from-accent-indigo/10 to-purple-600/10">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-indigo to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-lg">
                                {getInitials(userName)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-100 text-sm truncate">{userName}</p>
                                <p className="text-slate-400 text-xs truncate">{userEmail}</p>
                            </div>
                        </div>
                    </div>

                    {/* Primary Menu Items */}
                    <div className="py-1.5">
                        {menuItems.map((item) =>
                            item.href ? (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center gap-3"
                                >
                                    <span className="text-base">{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            ) : (
                                <button
                                    key={item.label}
                                    onClick={item.onClick}
                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center gap-3"
                                >
                                    <span className="text-base">{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            )
                        )}
                    </div>

                    <div className="border-t border-white/[0.06]" />

                    {/* Secondary Items */}
                    <div className="py-1.5">
                        {secondaryItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={item.onClick}
                                className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center gap-3"
                            >
                                <span className="text-base">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-white/[0.06]" />

                    {/* Logout */}
                    <div className="py-1.5">
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2.5 text-left text-sm text-accent-rose hover:bg-accent-rose/10 transition-colors flex items-center gap-3 font-medium"
                        >
                            <span className="text-base">🚪</span>
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvatarDropdown;
