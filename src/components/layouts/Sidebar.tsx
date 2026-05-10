'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home, Headphones, Mic, MessageCircle, BookOpen,
    Star, List as ListIcon, Library, Trophy, BarChart2,
    Crown, ArrowRight, X
} from 'lucide-react';
import { AvatarDropdown } from './AvatarDropdown';

export const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const isActive = (path: string) => path !== '#' && (pathname === path || pathname.startsWith(`${path}/`));

    const sections = [
        {
            title: 'TỔNG QUAN',
            items: [
                { href: '/', label: 'Trang chủ', icon: <Home size={18} /> },
            ]
        },
        {
            title: 'HỌC TẬP',
            items: [
                { href: '/flashcards', label: 'Thẻ ghi nhớ', icon: <BookOpen size={18} /> },
                { href: '/import', label: 'Import từ vựng', icon: <Mic size={18} /> },
                { href: '/ai-lookup', label: 'AI Tra cứu', icon: <Library size={18} /> },
            ]
        },
        // {
        //     title: 'THƯ VIỆN',
        //     items: [
        //         // { href: '/dashboard', label: 'Thư viện của bạn', icon: <ListIcon size={18} /> },
        //         // { href: '/create', label: 'Tạo thư mục mới', icon: <Star size={18} /> },
        //         { href: '/import', label: 'Import từ vựng', icon: <Mic size={18} /> },
        //     ]
        // },
        {
            title: 'CỘNG ĐỒNG & TIẾN ĐỘ',
            items: [
                { href: '/groups', label: 'Nhóm học', icon: <Trophy size={18} />, badge: 'Mới' },
                { href: '/progress', label: 'Tiến trình học', icon: <BarChart2 size={18} /> },
            ]
        }
    ];

    return (
        <aside className="w-[260px] flex-shrink-0 h-screen sticky top-0 bg-surface-900 border-r border-white/[0.04] flex flex-col hidden md:flex font-body overflow-hidden">
            {/* Header / Logo */}
            <div className="h-20 flex items-center justify-between px-6 flex-shrink-0">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="text-accent-indigo flex items-center justify-center">
                        {/* Custom S-like SVG based on SENGLISH logo */}
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.5 4.5C12.5 3.5 9 3.5 7 5.5C5 7.5 5 11 7 13C8.5 14.5 11 15 13 15C15.5 15 17 17.5 17 19.5C17 21.5 14.5 22.5 12 22.5C9.5 22.5 7 21.5 6 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9.5 19.5C11.5 20.5 15 20.5 17 18.5C19 16.5 19 13 17 11C15.5 9.5 13 9 11 9C8.5 9 7 6.5 7 4.5C7 2.5 9.5 1.5 12 1.5C14.5 1.5 17 2.5 18 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                        </svg>
                    </div>
                    <span className="text-[17px] font-bold text-slate-100 tracking-wider">
                        HELLOENGLISH
                    </span>
                </Link>
                <button className="text-slate-400 hover:text-white transition">
                    <X size={20} />
                </button>
            </div>

            {/* Navigation Lists */}
            <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="space-y-6">
                    {sections.map((section, idx) => (
                        <div key={idx}>
                            {/* Section Title with dashed line */}
                            <div className="flex items-center gap-2 mb-3 px-2">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex-shrink-0">
                                    {section.title}
                                </span>
                                <div className="flex-1 border-b border-dashed border-white/[0.08] h-px mt-0.5"></div>
                            </div>

                            {/* Items */}
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className={`flex items-center gap-3.5 px-3 py-2.5 rounded-[14px] transition-all duration-200 font-medium ${active
                                                ? 'bg-white/[0.08] text-white shadow-sm'
                                                : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                                                }`}
                                        >
                                            <span className={active ? 'text-accent-indigo-light' : 'text-slate-400'}>
                                                {item.icon}
                                            </span>
                                            <span className="flex-1 text-[15px]">{item.label}</span>
                                            {item.badge && (
                                                <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-slate-300 text-xs font-bold font-mono">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 space-y-3 flex-shrink-0 border-t border-white/[0.02]">
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-[14px] border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors group">
                    <Crown size={16} className="text-yellow-500" />
                    <span className="text-[14px] font-medium text-yellow-500 group-hover:text-yellow-400">Nâng cấp Premium</span>
                    <ArrowRight size={16} className="text-yellow-500" />
                </button>

                <AvatarDropdown />
            </div>
        </aside>
    );
};

export default Sidebar;
