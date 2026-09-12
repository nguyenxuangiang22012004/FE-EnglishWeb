'use client';

import React, { useState, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';
import QuickLookupModal from './QuickLookupModal';

export const QuickLookupWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Global keyboard shortcut: Ctrl+K / Cmd+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            {/* Floating Action Button (Bottom Right) */}
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 text-white shadow-[0_4px_25px_rgba(219,39,119,0.45)] hover:shadow-[0_6px_30px_rgba(219,39,119,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
                    title="Tra cứu từ nhanh (Ctrl + K)"
                    aria-label="Tra cứu từ vựng"
                >
                    {/* Pulsing Aura */}
                    <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 opacity-40 blur-sm group-hover:opacity-75 animate-pulse transition duration-300" />

                    {/* Icon */}
                    <div className="relative flex items-center justify-center">
                        <Search className="w-6 h-6 text-white transition-transform group-hover:rotate-12 duration-200" />
                        <Sparkles className="w-3.5 h-3.5 text-pink-200 absolute -top-1.5 -right-1.5 animate-bounce" />
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-[#140e1c] border border-pink-500/30 text-slate-200 text-xs font-medium shadow-xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap pointer-events-none hidden sm:flex items-center gap-1.5">
                        <span>Tra từ nhanh</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-pink-300">
                            Ctrl+K
                        </kbd>
                    </div>
                </button>
            </div>

            {/* Quick Lookup Modal */}
            <QuickLookupModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
};

export default QuickLookupWidget;
