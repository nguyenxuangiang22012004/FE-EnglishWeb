'use client';

import React from 'react';

interface GroupCardProps { id: string; name: string; description?: string; memberCount: number; cardCount: number; isOwner?: boolean; }

export const GroupCard: React.FC<GroupCardProps> = ({ id, name, description, memberCount, cardCount, isOwner = false }) => {
    const handleJoin = () => console.log('Join', id);
    const handleLeave = () => console.log('Leave', id);
    const handleEdit = () => console.log('Edit', id);
    const handleDelete = () => console.log('Delete', id);

    return (
        <div className="glass-card-hover p-6 flex flex-col">
            <h3 className="text-lg font-display font-bold text-slate-200 mb-2">{name}</h3>
            {description && <p className="text-slate-400 text-sm mb-4">{description}</p>}
            <div className="flex gap-4 mb-4 text-sm text-slate-400">
                <div className="flex items-center gap-1.5"><span>👥</span><span>{memberCount} thành viên</span></div>
                <div className="flex items-center gap-1.5"><span>📚</span><span>{cardCount} từ</span></div>
            </div>
            <div className="flex gap-2 mt-auto">
                {isOwner ? (
                    <>
                        <button onClick={handleEdit} className="flex-1 py-2 bg-accent-indigo/10 border border-accent-indigo/20 text-accent-indigo-light rounded-xl hover:bg-accent-indigo/20 text-sm font-semibold transition">✏️ Chỉnh sửa</button>
                        <button onClick={handleDelete} className="flex-1 py-2 bg-accent-rose/10 border border-accent-rose/20 text-accent-rose rounded-xl hover:bg-accent-rose/20 text-sm font-semibold transition">🗑️ Xóa</button>
                    </>
                ) : (
                    <>
                        <button onClick={handleJoin} className="flex-1 py-2 bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald rounded-xl hover:bg-accent-emerald/20 text-sm font-semibold transition">➕ Tham gia</button>
                        <button onClick={handleLeave} className="flex-1 py-2 bg-white/[0.04] border border-white/[0.08] text-slate-400 rounded-xl hover:bg-white/[0.08] text-sm font-semibold transition">➖ Rời nhóm</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default GroupCard;
