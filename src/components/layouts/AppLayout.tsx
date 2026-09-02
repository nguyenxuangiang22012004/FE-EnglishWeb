'use client';

import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
    children: React.ReactNode;
    noScroll?: boolean;
    noPadding?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, noScroll, noPadding }) => {
    return (
        <div className="flex h-screen overflow-hidden bg-surface-900 mesh-bg">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <main className={`flex-1 ${noScroll ? 'flex flex-col min-h-0' : 'overflow-y-auto'} ${noPadding ? '' : 'p-4 sm:p-6 lg:p-8'}`}>
                    <div className={noScroll ? 'flex-1 flex flex-col min-h-0' : 'max-w-7xl mx-auto'}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
