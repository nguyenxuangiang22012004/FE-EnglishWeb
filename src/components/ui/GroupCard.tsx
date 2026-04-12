'use client';

import React from 'react';

interface GroupCardProps {
    id: string;
    name: string;
    description?: string;
    memberCount: number;
    cardCount: number;
    isOwner?: boolean;
}

export const GroupCard: React.FC<GroupCardProps> = ({
    id,
    name,
    description,
    memberCount,
    cardCount,
    isOwner = false,
}) => {
    const handleJoin = () => console.log('Join', id);
    const handleLeave = () => console.log('Leave', id);
    const handleEdit = () => console.log('Edit', id);
    const handleDelete = () => console.log('Delete', id);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{name}</h3>
            {description && <p className="text-gray-600 text-sm mb-4">{description}</p>}

            <div className="flex gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1">
                    <span>👥</span>
                    <span>{memberCount} thành viên</span>
                </div>
                <div className="flex items-center gap-1">
                    <span>📚</span>
                    <span>{cardCount} từ</span>
                </div>
            </div>

            <div className="flex gap-2 mt-auto">
                {isOwner ? (
                    <>
                        <button
                            onClick={handleEdit}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                        >
                            ✏️ Chỉnh sửa
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold"
                        >
                            🗑️ Xóa
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleJoin}
                            className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                        >
                            ➕ Tham gia
                        </button>
                        <button
                            onClick={handleLeave}
                            className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-semibold"
                        >
                            ➖ Rời nhóm
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default GroupCard;
