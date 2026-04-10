'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AvatarDropdown } from './AvatarDropdown';

export const Header: React.FC = () => {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900';

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

                <div className="flex items-center space-x-4">
                    <AvatarDropdown />
                </div>
            </nav>
        </header>
    );
};

export default Header;
