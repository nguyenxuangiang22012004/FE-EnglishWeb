

import React from 'react';
import Link from 'next/link';

export const Dashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
                <h1 className="text-4xl font-bold mb-2">👋 Chào mừng trở lại!</h1>
                <p className="text-blue-100">Hôm nay bạn học được bao nhiêu từ? 🚀</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Tổng từ vựng</p>
                            <p className="text-3xl font-bold text-blue-600">245</p>
                        </div>
                        <div className="text-4xl">📚</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Đã thuộc</p>
                            <p className="text-3xl font-bold text-green-600">156</p>
                        </div>
                        <div className="text-4xl">✅</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Chuỗi ngày liên tiếp</p>
                            <p className="text-3xl font-bold text-orange-600">12</p>
                        </div>
                        <div className="text-4xl">🔥</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Nhóm học</p>
                            <p className="text-3xl font-bold text-purple-600">5</p>
                        </div>
                        <div className="text-4xl">👥</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">⚡ Hành động nhanh</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/create">
                        <button className="w-full bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition text-left cursor-pointer">
                            <div className="text-3xl mb-2">➕</div>
                            <h3 className="font-bold text-gray-800">Tạo Flashcard</h3>
                            <p className="text-sm text-gray-600 mt-1">Thêm từ vựng mới</p>
                        </button>
                    </Link>

                    <Link href="/import">
                        <button className="w-full bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition text-left cursor-pointer">
                            <div className="text-3xl mb-2">📁</div>
                            <h3 className="font-bold text-gray-800">Import Dữ Liệu</h3>
                            <p className="text-sm text-gray-600 mt-1">Paste từ ChatGPT</p>
                        </button>
                    </Link>

                    <Link href="/ai-lookup">
                        <button className="w-full bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition text-left cursor-pointer">
                            <div className="text-3xl mb-2">🤖</div>
                            <h3 className="font-bold text-gray-800">Tra Cứu AI</h3>
                            <p className="text-sm text-gray-600 mt-1">Tim từ nhanh</p>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Recent Study */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📖 Bộ sưu tập gần đây</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-gray-800">Business English</h3>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">45 từ</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">Từ vựng kinh tế</p>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: '60%' }} />
                            </div>
                            <p className="text-xs text-gray-600 mt-2">27/45 từ đã thuộc</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
