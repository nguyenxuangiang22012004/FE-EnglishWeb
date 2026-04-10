'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export const Header: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (path: string) => pathname === path ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900';

    const handleLogout = () => {
        if (window.confirm('Bạn chắc chắn muốn đăng xuất?')) {
            // TODO: Clear auth token
            router.push('/auth/login');
        }
    };

    return (
        <header className="bg-white shadow sticky top-0 z-40">
            <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-blue-600">
                    📚 FlashCards Pro
                </Link>

                <div className="flex space-x-6 text-sm font-semibold">
                    <Link href="/dashboard" className={`pb-2 ${isActive('/dashboard')}`}>
                        Dashboard
                    </Link>
                    <Link href="/flashcards" className={`pb-2 ${isActive('/flashcards')}`}>
                        Flashcards
                    </Link>
                    <Link href="/ai-lookup" className={`pb-2 ${isActive('/ai-lookup')}`}>
                        🤖 AI Tra Cứu
                    </Link>
                    <Link href="/quiz" className={`pb-2 ${isActive('/quiz')}`}>
                        Quiz
                    </Link>
                    <Link href="/groups" className={`pb-2 ${isActive('/groups')}`}>
                        👥 Nhóm Học
                    </Link>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={() => alert('Chức năng cài đặt sẽ được cập nhật')}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                        ⚙️ Cài đặt
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-semibold"
                    >
                        🚪 Đăng xuất
                    </button>
                </div>
            </nav>
        </header>
    );
};

export default Header;
