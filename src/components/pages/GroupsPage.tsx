

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
                <h1 className="text-4xl font-bold text-gray-800">👥 Nhóm Học</h1>
                <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                    ➕ Tạo Nhóm Mới
                </button>
            </div>

            {/* Join Group Section */}
            <div className="bg-blue-50 rounded-xl shadow-lg p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-4">🔗 Tham gia nhóm</h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Nhập mã nhóm hoặc link..."
                        className="flex-1 px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                        Tham gia
                    </button>
                </div>
            </div>

            {/* Groups Grid */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Nhóm của tôi</h2>
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
