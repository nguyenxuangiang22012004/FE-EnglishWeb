import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-blue-600">Web Học Tiếng Anh</h1>
                        <div className="space-x-4">
                            <a href="/" className="text-gray-600 hover:text-gray-900">Trang Chủ</a>
                            <a href="/lessons" className="text-gray-600 hover:text-gray-900">Bài Học</a>
                            <a href="/about" className="text-gray-600 hover:text-gray-900">Về</a>
                        </div>
                    </div>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            <footer className="bg-gray-900 text-white mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p className="text-center">
                        © {new Date().getFullYear()} Web Học Tiếng Anh. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
