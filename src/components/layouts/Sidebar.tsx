'use client';

import React from 'react';

interface SidebarProps {
    children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
    return (
        <aside className="w-64 bg-gray-100 p-6 hidden md:block">
            <div className="space-y-4">
                <div className="text-lg font-bold text-gray-800">Bộ Sưu Tập</div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {children}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
