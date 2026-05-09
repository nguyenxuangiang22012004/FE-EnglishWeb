import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-surface-900 mesh-bg">
            <header className="bg-surface-900/80 backdrop-blur-2xl border-b border-white/[0.06]">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-display font-bold gradient-text">Web Học Tiếng Anh</h1>
                        <div className="space-x-4">
                            <a href="/" className="text-slate-400 hover:text-slate-200 transition-colors">Trang Chủ</a>
                            <a href="/lessons" className="text-slate-400 hover:text-slate-200 transition-colors">Bài Học</a>
                            <a href="/about" className="text-slate-400 hover:text-slate-200 transition-colors">Về</a>
                        </div>
                    </div>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {children}
            </main>

            <footer className="border-t border-white/[0.06] mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p className="text-center text-slate-500 text-sm">
                        © {new Date().getFullYear()} Web Học Tiếng Anh. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
