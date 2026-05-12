'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Dropdown, MenuProps, Modal } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { FlashcardSet } from '@/store/slices/flashcardSlice';

interface FlashcardSetListProps { 
    sets: FlashcardSet[]; 
    onEdit?: (set: FlashcardSet) => void;
    onDelete?: (setId: string) => void;
    onViewDetails?: (set: FlashcardSet) => void;
}

const getProgressStats = (cards: FlashcardSet['cards']) => {
    const total = cards.length;
    const mastered = cards.filter((c) => c.status === 'mastered').length;
    const learning = cards.filter((c) => c.status === 'learning').length;
    const unknown = total - mastered - learning;
    const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;
    return { total, mastered, learning, unknown, percent };
};

export const FlashcardSetList: React.FC<FlashcardSetListProps> = ({ sets, onEdit, onDelete, onViewDetails }) => {
    const router = useRouter();
    const handleSelect = (set: FlashcardSet) => { 
        if (onViewDetails) {
            onViewDetails(set);
        } else {
            router.push(`/flashcards/${set.id}`); 
        }
    };
    const handleStudy = (set: FlashcardSet) => { 
        if (set.cards.length === 0) {
            router.push(`/create?setId=${set.id}`);
        } else {
            router.push(`/flashcards/${set.id}`); 
        }
    };
    const handleQuiz = (setId: string) => { router.push(`/quiz?setId=${setId}`); };

    const confirmDelete = (setId: string, setName: string) => {
        Modal.confirm({
            title: 'Xóa bộ flashcard',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn xóa bộ "${setName}"? Hành động này không thể hoàn tác.`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                onDelete?.(setId);
            },
        });
    };

    if (sets.length === 0) {
        return (
            <div className="glass-card border-2 border-dashed border-accent-amber/20 p-8 text-center">
                <div className="text-5xl mb-4">📭</div>
                <h2 className="text-2xl font-display font-bold text-slate-200 mb-2">Chưa có bộ flashcard nào</h2>
                <p className="text-slate-400">Hãy tạo bộ flashcard đầu tiên để bắt đầu học!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sets.map((set) => {
                const { total, mastered, learning, unknown, percent } = getProgressStats(set.cards);
                return (
                    <div key={set.id} className="glass-card-hover p-5 relative group/card">
                        {/* More Menu */}
                        <div className="absolute top-4 right-4 z-10">
                            <Dropdown
                                menu={{
                                    items: [
                                        { key: 'view', label: 'Xem danh sách', icon: <UnorderedListOutlined />, onClick: () => onViewDetails?.(set) },
                                        { type: 'divider' },
                                        { key: 'edit', label: 'Chỉnh sửa', icon: <EditOutlined />, onClick: () => onEdit?.(set) },
                                        { key: 'delete', label: 'Xóa', icon: <DeleteOutlined />, danger: true, onClick: () => confirmDelete(set.id, set.name) },
                                    ],
                                }}
                                trigger={['click']}
                                placement="bottomRight"
                            >
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-all opacity-0 group-hover/card:opacity-100">
                                    <MoreOutlined style={{ fontSize: '18px' }} />
                                </button>
                            </Dropdown>
                        </div>

                        <div className="flex items-center gap-3 mb-3 cursor-pointer group" onClick={() => handleSelect(set)}>
                            <span className="text-3xl">{set.emoji ?? '📦'}</span>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-display font-bold text-slate-200 truncate group-hover:text-accent-indigo-light transition-colors pr-6">{set.name}</h3>
                                {set.description && <p className="text-xs text-slate-500 truncate mt-0.5">{set.description}</p>}
                            </div>
                        </div>
                        <div className="w-full bg-white/[0.06] rounded-full h-1.5 mb-3">
                            <div className="bg-gradient-to-r from-accent-indigo to-accent-emerald h-1.5 rounded-full transition-all duration-500 shimmer-bar" style={{ width: `${percent}%` }} />
                        </div>
                        <div className="flex justify-between text-xs font-medium mb-4">
                            <span className="text-slate-500">{total} từ</span>
                            <div className="flex gap-2">
                                <span className="text-accent-emerald">✅ {mastered}</span>
                                <span className="text-accent-amber">📖 {learning}</span>
                                <span className="text-accent-rose">❌ {unknown}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => handleStudy(set)} className="py-2 text-sm font-medium text-slate-300 bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.08] transition">📖 Học</button>
                            <button onClick={() => handleQuiz(set.id)} disabled={total < 4} title={total < 4 ? 'Cần ít nhất 4 từ' : ''} className="py-2 text-sm font-semibold text-accent-indigo-light bg-accent-indigo/10 border border-accent-indigo/20 rounded-xl hover:bg-accent-indigo/15 transition disabled:opacity-40 disabled:cursor-not-allowed">🎯 Quiz</button>
                        </div>
                        {total < 4 && <p className="text-xs text-slate-600 text-center mt-2">Cần ít nhất 4 từ để làm quiz</p>}
                    </div>
                );
            })}
        </div>
    );
};

export default FlashcardSetList;