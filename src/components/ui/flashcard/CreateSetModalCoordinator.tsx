'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export const CreateSetModalCoordinator: React.FC = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const router = useRouter();

    return (
        <>
            <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-2 transition shadow-md"
            >
                ➕ Tạo bộ mới
            </button>

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-800">Tạo bộ mới</h2>
                            <p className="text-gray-500">Chọn phương thức bạn muốn bắt đầu</p>
                        </div>
                        <div className="p-4 grid gap-2">
                            {[
                                { title: 'Tạo thủ công', desc: 'Nhập tay từng từ', icon: '✍️', path: '/create' },
                                { title: 'Tạo bằng AI', desc: 'Tự động sinh từ theo chủ đề', icon: '🤖', path: '/import' },
                                { title: 'Import từ Excel', desc: 'Tải file .xlsx', icon: '📊', path: '/create/excel' },
                                { title: 'Import từ Word', desc: 'Tải file .docx', icon: '📄', path: '/create/docs' },
                            ].map((opt) => (
                                <button
                                    key={opt.path}
                                    onClick={() => { setShowCreateModal(false); router.push(opt.path); }}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 rounded-2xl text-left transition group"
                                >
                                    <div className="text-3xl bg-gray-100 group-hover:bg-white w-14 h-14 flex items-center justify-center rounded-xl transition">{opt.icon}</div>
                                    <div>
                                        <div className="font-bold text-gray-800">{opt.title}</div>
                                        <div className="text-sm text-gray-500">{opt.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="p-4 bg-gray-50 border-t">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="w-full py-3 text-gray-500 font-semibold hover:text-gray-700 transition"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
