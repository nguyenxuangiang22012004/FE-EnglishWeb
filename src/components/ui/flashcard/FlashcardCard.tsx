'use client';

import React from 'react';
import { Dropdown, MenuProps } from 'antd';
import {
    CheckCircleOutlined,
    BookOutlined,
    CloseCircleOutlined,
    DownOutlined
} from '@ant-design/icons';

type Status = 'unknown' | 'learning' | 'mastered';

interface FlashcardProps {
    word: string;
    meaning: string;
    pronunciation?: string;
    example?: string;
    image?: string;
    isFlipped?: boolean;
    status?: Status;
    onFlip?: () => void;
    onPlaySound?: () => void;
    onStatusChange?: (newStatus: Status) => void;
}

export const FlashcardCard: React.FC<FlashcardProps> = ({
    word,
    meaning,
    pronunciation,
    example,
    image,
    isFlipped = false,
    status = 'unknown',
    onFlip,
    onPlaySound,
    onStatusChange,
}) => {

    const STATUS_MAP: Record<Status, { label: string; color: string }> = {
        mastered: { label: 'Thuộc', color: '#52c41a' },
        learning: { label: 'Đang học', color: '#faad14' },
        unknown: { label: 'Chưa biết', color: '#ff4d4f' },
    };

    const statusMenuItems: MenuProps['items'] = [
        { key: 'unknown', label: 'Chưa biết', icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> },
        { key: 'learning', label: 'Đang học', icon: <BookOutlined style={{ color: '#faad14' }} /> },
        { key: 'mastered', label: 'Đã thuộc', icon: <CheckCircleOutlined style={{ color: '#52c41a' }} /> },
    ];

    const handleMenuClick: MenuProps['onClick'] = ({ key, domEvent }) => {
        domEvent.stopPropagation();
        onStatusChange?.(key as Status);
    };

    const StatusSelector = () => (
        <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
                menu={{ items: statusMenuItems, onClick: handleMenuClick }}
                trigger={['click']}
                placement="bottomRight"
            >
                <div
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-all border border-white/30 text-white cursor-pointer select-none active:scale-95 shadow-sm"
                >
                    <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: STATUS_MAP[status].color }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        {STATUS_MAP[status].label}
                    </span>
                    <DownOutlined style={{ fontSize: '8px', opacity: 0.8 }} />
                </div>
            </Dropdown>
        </div>
    );

    return (
        <div className="flex items-center justify-center w-full">
            <div
                className="w-full max-w-sm h-64 cursor-pointer select-none"
                style={{ perspective: '1000px' }}
                onClick={onFlip}
            >
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)',
                        transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                    }}
                >
                    {/* Mặt trước */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 flex flex-col justify-between"
                        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="text-white text-2xl font-bold truncate">{word}</h3>
                                {pronunciation && (
                                    <p className="text-blue-100 text-sm mt-1 font-mono opacity-90">{pronunciation}</p>
                                )}
                            </div>
                            <StatusSelector />
                        </div>

                        {image && (
                            <div className="w-full h-20 bg-white/10 rounded-lg flex items-center justify-center text-white/50 text-xs border border-white/10">
                                [Hình ảnh]
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <span className="text-white text-[10px] opacity-60 italic">👆 Chạm để lật thẻ</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPlaySound?.();
                                }}
                                className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full text-white text-xl hover:bg-white/40 active:scale-90 transition-all shadow-lg"
                            >
                                🔊
                            </button>
                        </div>
                    </div>

                    {/* Mặt sau */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl shadow-lg p-6 flex flex-col justify-between"
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                        }}
                    >
                        <div className="flex justify-between items-start">
                            <h3 className="text-white text-2xl font-bold flex-1 leading-tight">{meaning}</h3>
                            <StatusSelector />
                        </div>

                        {example && (
                            <div className="bg-black/10 p-3 rounded-lg border border-white/10 overflow-hidden">
                                <p className="text-blue-50 italic text-sm leading-snug line-clamp-3">
                                    <span className="font-bold not-italic text-white">Ví dụ:</span> {example}
                                </p>
                            </div>
                        )}

                        <div className="text-white text-[10px] opacity-50 text-center uppercase tracking-widest">
                            Quay lại
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlashcardCard;