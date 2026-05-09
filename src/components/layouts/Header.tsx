'use client';

import React from 'react';
import { AvatarDropdown } from './AvatarDropdown';

export const Header: React.FC = () => {
    return (
        <header className="h-16 sticky top-0 z-40 bg-surface-900/80 backdrop-blur-2xl border-b border-white/[0.06] px-4 sm:px-6 flex items-center justify-between">
            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-slate-400 hover:text-white mr-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>

            {/* Search Bar - Center aligned ideally, but stretches */}
            <div className="flex-1 max-w-2xl mx-auto md:ml-4">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-slate-500 group-focus-within:text-accent-indigo-light transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="w-full bg-white/[0.05] border border-white/[0.08] text-slate-200 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-indigo/50 focus:bg-white/[0.08] transition-all"
                        placeholder="Tìm kiếm thẻ ghi nhớ, lớp học..."
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 ml-4">
                <button className="w-8 h-8 rounded-full bg-accent-indigo text-white flex items-center justify-center hover:bg-accent-indigo-light transition-colors shadow-lg shadow-accent-indigo/20 flex-shrink-0" title="Tạo mới">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
                
                <button className="hidden sm:block px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 text-xs font-bold rounded-full transition-colors whitespace-nowrap">
                    Nâng cấp: dùng thử miễn phí 7 ngày
                </button>

                <div className="pl-2 border-l border-white/[0.08]">
                    <AvatarDropdown />
                </div>
            </div>
        </header>
    );
};

export default Header;
