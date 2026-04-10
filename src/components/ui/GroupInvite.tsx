'use client';

import React from 'react';

interface GroupInviteProps {
    groupCode?: string;
    groupLink?: string;
    groupName?: string;
    onCopyCode?: () => void;
    onCopyLink?: () => void;
    onShare?: () => void;
}

export const GroupInvite: React.FC<GroupInviteProps> = ({
    groupCode,
    groupLink,
    groupName,
    onCopyCode,
    onCopyLink,
    onShare,
}) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">👥 Mời vào nhóm</h2>
            {groupName && <p className="text-gray-600 mb-4">Nhóm: <span className="font-semibold">{groupName}</span></p>}

            <div className="space-y-4">
                {/* Group Code */}
                {groupCode && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mã nhóm:</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={groupCode}
                                readOnly
                                className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-center font-mono font-bold text-lg"
                            />
                            <button
                                onClick={onCopyCode}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                            >
                                📋 Copy
                            </button>
                        </div>
                    </div>
                )}

                {/* Group Link */}
                {groupLink && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Link nhóm:</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={groupLink}
                                readOnly
                                className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm truncate"
                            />
                            <button
                                onClick={onCopyLink}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                            >
                                📋 Copy
                            </button>
                        </div>
                    </div>
                )}

                {/* Share Button */}
                <button
                    onClick={onShare}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
                >
                    🔗 Chia sẻ
                </button>
            </div>
        </div>
    );
};

export default GroupInvite;
