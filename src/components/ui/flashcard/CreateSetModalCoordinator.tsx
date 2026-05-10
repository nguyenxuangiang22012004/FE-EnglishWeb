'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import flashcardService from '@/services/flashcardService';

interface CreateSetFormData {
    name: string;
    description: string;
    emoji: string;
    isPublic: boolean;
}

interface CreateSetModalCoordinatorProps {
    onSetCreated?: () => void;
    editingSet?: any | null; // Using any for now to avoid complex type mismatch, or I can import FlashcardSet
    onClose?: () => void;
}

export const CreateSetModalCoordinator: React.FC<CreateSetModalCoordinatorProps> = ({ onSetCreated, editingSet, onClose }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(!!editingSet);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState<CreateSetFormData>({
        name: editingSet?.name || '', 
        description: editingSet?.description || '', 
        emoji: editingSet?.emoji || '📚', 
        isPublic: editingSet?.isPublic || false,
    });

    // Update form when editingSet changes
    React.useEffect(() => {
        if (editingSet) {
            setForm({
                name: editingSet.name,
                description: editingSet.description || '',
                emoji: editingSet.emoji || '📚',
                isPublic: editingSet.isPublic || false,
            });
            setShowFormModal(true);
        }
    }, [editingSet]);

    const router = useRouter();

    const EMOJI_LIST = ['📚', '🌟', '🎯', '🔥', '💡', '🧠', '✍️', '📖', '🇺🇸', '🇯🇵', '🇰🇷', '🎓'];

    const handleSaveSet = async () => {
        if (!form.name.trim()) { setError('Vui lòng nhập tên bộ từ!'); return; }
        setIsLoading(true);
        setError('');
        try {
            if (editingSet) {
                const res = await flashcardService.updateSet(editingSet.id, {
                    name: form.name,
                    description: form.description || undefined,
                    emoji: form.emoji,
                    isPublic: form.isPublic,
                });
                if (res.success) {
                    setShowFormModal(false);
                    onSetCreated?.();
                    onClose?.();
                }
            } else {
                const res = await flashcardService.createSet({
                    name: form.name,
                    description: form.description || undefined,
                    emoji: form.emoji,
                    isPublic: form.isPublic,
                });
                if (res.success) {
                    setShowFormModal(false);
                    setForm({ name: '', description: '', emoji: '📚', isPublic: false });
                    onSetCreated?.();
                    // Navigate to add cards to the new set
                    router.push(`/create?setId=${res.data.id}`);
                }
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {!editingSet && (
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                >
                    ➕ Tạo bộ mới
                </button>
            )}

            {/* Method selection modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1f35] border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-white/10">
                            <h2 className="text-2xl font-bold text-slate-100">Tạo bộ mới</h2>
                            <p className="text-slate-400 text-sm mt-1">Chọn phương thức bạn muốn bắt đầu</p>
                        </div>
                        <div className="p-4 grid gap-2">
                            {[
                                { title: 'Tạo thủ công', desc: 'Nhập tay từng từ', icon: '✍️', action: () => { setShowCreateModal(false); setShowFormModal(true); } },
                                { title: 'Tạo bằng AI', desc: 'Tự động sinh từ theo chủ đề', icon: '🤖', path: '/import' },
                                { title: 'Import từ Excel', desc: 'Tải file .xlsx', icon: '📊', path: '/create/excel' },
                                { title: 'Import từ Word', desc: 'Tải file .docx', icon: '📄', path: '/create/docs' },
                            ].map((opt) => (
                                <button
                                    key={opt.title}
                                    onClick={() => {
                                        if (opt.action) { opt.action(); }
                                        else if (opt.path) { setShowCreateModal(false); router.push(opt.path); }
                                    }}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.05] rounded-xl text-left transition group"
                                >
                                    <div className="text-3xl bg-white/[0.05] group-hover:bg-white/[0.08] w-14 h-14 flex items-center justify-center rounded-xl transition">{opt.icon}</div>
                                    <div>
                                        <div className="font-bold text-slate-200">{opt.title}</div>
                                        <div className="text-sm text-slate-500">{opt.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="p-4 border-t border-white/10">
                            <button onClick={() => setShowCreateModal(false)} className="w-full py-3 text-slate-500 font-semibold hover:text-slate-300 transition">Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Set Form Modal */}
            {showFormModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1f35] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-5 border-b border-white/10">
                            <h2 className="text-xl font-bold text-slate-100">{editingSet ? '📝 Chỉnh sửa bộ flashcard' : '📝 Tạo bộ flashcard'}</h2>
                            <p className="text-slate-400 text-sm mt-0.5">{editingSet ? 'Cập nhật thông tin bộ từ của bạn' : 'Sau đó bạn sẽ thêm từ vào bộ'}</p>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Emoji picker */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Biểu tượng</label>
                                <div className="flex flex-wrap gap-2">
                                    {EMOJI_LIST.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => setForm(f => ({ ...f, emoji }))}
                                            className={`text-xl w-10 h-10 rounded-lg transition border ${form.emoji === emoji ? 'border-indigo-500 bg-indigo-500/20' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]'}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Tên bộ từ <span className="text-red-400">*</span></label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: IELTS Vocabulary, Tiếng Anh Cơ Bản..."
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    onKeyDown={e => e.key === 'Enter' && handleSaveSet()}
                                    className="w-full bg-white/[0.04] border border-white/10 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Mô tả (tuỳ chọn)</label>
                                <textarea
                                    placeholder="Mô tả ngắn về bộ từ này..."
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={2}
                                    className="w-full bg-white/[0.04] border border-white/10 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                                />
                            </div>

                            {/* Is public */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className={`relative w-10 h-5 rounded-full transition-colors ${form.isPublic ? 'bg-indigo-500' : 'bg-white/10'}`}
                                    onClick={() => setForm(f => ({ ...f, isPublic: !f.isPublic }))}>
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isPublic ? 'left-5' : 'left-0.5'}`} />
                                </div>
                                <span className="text-sm text-slate-400">Công khai bộ từ này</span>
                            </label>

                            {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}
                        </div>

                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={() => { setShowFormModal(false); setError(''); onClose?.(); }}
                                className="flex-1 py-2.5 text-slate-400 border border-white/10 rounded-xl hover:bg-white/[0.04] transition font-medium"
                                disabled={isLoading}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSaveSet}
                                disabled={isLoading || !form.name.trim()}
                                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{editingSet ? 'Đang lưu...' : 'Đang tạo...'}</>
                                ) : (editingSet ? '✅ Lưu thay đổi' : '✅ Tạo & Thêm từ')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
