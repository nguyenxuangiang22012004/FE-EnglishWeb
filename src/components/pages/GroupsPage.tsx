

import React from 'react';
import { GroupCard } from '@/components/ui/GroupCard';

const mockGroups = [
    {
        id: '1',
        name: 'Business English',
        description: 'Từ vựng kinh tế',
        memberCount: 12,
        cardCount: 45,
        isOwner: true,
    },
    {
        id: '2',
        name: 'IELTS Prep',
        description: 'Chuẩn bị thi IELTS',
        memberCount: 28,
        cardCount: 120,
        isOwner: false,
    },
    {
        id: '3',
        name: 'Daily Vocabulary',
        description: 'Từ vựng hàng ngày',
        memberCount: 45,
        cardCount: 200,
        isOwner: false,
    },
];

export const GroupsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-display font-bold text-slate-100">👥 Nhóm Học</h1>
                <button className="px-5 py-2.5 bg-gradient-to-r from-accent-emerald to-accent-cyan text-white rounded-xl font-semibold glow-btn text-sm">
                    ➕ Tạo Nhóm Mới
                </button>
            </div>

            {/* Join Group Section */}
            <div className="glass-card p-6 border border-accent-indigo/20 bg-gradient-to-r from-accent-indigo/5 to-transparent">
                <h3 className="text-lg font-display font-bold text-accent-indigo-light mb-4">🔗 Tham gia nhóm</h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Nhập mã nhóm hoặc link..."
                        className="flex-1 px-4 py-3 glass-input"
                    />
                    <button className="px-6 py-3 bg-gradient-to-r from-accent-indigo to-accent-indigo-light text-white rounded-xl font-semibold glow-btn text-sm">
                        Tham gia
                    </button>
                </div>
            </div>

            {/* Groups Grid */}
            <div>
                <h2 className="text-xl font-display font-bold text-slate-200 mb-4">Nhóm của tôi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockGroups.map((group) => (
                        <GroupCard
                            key={group.id}
                            id={group.id}
                            name={group.name}
                            description={group.description}
                            memberCount={group.memberCount}
                            cardCount={group.cardCount}
                            isOwner={group.isOwner}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GroupsPage;
