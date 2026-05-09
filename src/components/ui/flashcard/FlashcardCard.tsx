'use client';

import React from 'react';
import { Dropdown, MenuProps } from 'antd';
import { CheckCircleOutlined, BookOutlined, CloseCircleOutlined, DownOutlined } from '@ant-design/icons';

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

export const FlashcardCard: React.FC<FlashcardProps> = ({ word, meaning, pronunciation, example, image, isFlipped = false, status = 'unknown', onFlip, onPlaySound, onStatusChange }) => {
    const STATUS_MAP: Record<Status, { label: string; color: string }> = {
        mastered: { label: 'Thuộc', color: '#34d399' },
        learning: { label: 'Đang học', color: '#fbbf24' },
        unknown: { label: 'Chưa biết', color: '#fb7185' },
    };

    const statusMenuItems: MenuProps['items'] = [
        { key: 'unknown', label: 'Chưa biết', icon: <CloseCircleOutlined style={{ color: '#fb7185' }} /> },
        { key: 'learning', label: 'Đang học', icon: <BookOutlined style={{ color: '#fbbf24' }} /> },
        { key: 'mastered', label: 'Đã thuộc', icon: <CheckCircleOutlined style={{ color: '#34d399' }} /> },
    ];

    const handleMenuClick: MenuProps['onClick'] = ({ key, domEvent }) => { domEvent.stopPropagation(); onStatusChange?.(key as Status); };

    const StatusSelector = () => (
        <div onClick={(e) => e.stopPropagation()}>
            <Dropdown menu={{ items: statusMenuItems, onClick: handleMenuClick }} trigger={['click']} placement="bottomRight">
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/15 text-white cursor-pointer select-none active:scale-95 shadow-sm backdrop-blur-sm">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_MAP[status].color }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{STATUS_MAP[status].label}</span>
                    <DownOutlined style={{ fontSize: '8px', opacity: 0.8 }} />
                </div>
            </Dropdown>
        </div>
    );

    return (
        <div className="flex items-center justify-center w-full">
            <div className="w-full max-w-sm h-64 cursor-pointer select-none" style={{ perspective: '1000px' }} onClick={onFlip}>
                <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)', transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)' }}>
                    {/* Front */}
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-indigo via-purple-600 to-accent-indigo-light rounded-2xl shadow-2xl shadow-accent-indigo/20 p-6 flex flex-col justify-between" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="text-white text-2xl font-display font-bold truncate">{word}</h3>
                                {pronunciation && <p className="text-indigo-200 text-sm mt-1 font-mono opacity-90">{pronunciation}</p>}
                            </div>
                            <StatusSelector />
                        </div>
                        {image && <div className="w-full h-20 bg-white/10 rounded-xl flex items-center justify-center text-white/50 text-xs border border-white/10">[Hình ảnh]</div>}
                        <div className="flex justify-between items-center">
                            <span className="text-white text-[10px] opacity-50 italic">👆 Chạm để lật thẻ</span>
                            <button onClick={(e) => { e.stopPropagation(); onPlaySound?.(); }} className="w-10 h-10 flex items-center justify-center bg-white/15 rounded-full text-white text-xl hover:bg-white/30 active:scale-90 transition-all shadow-lg backdrop-blur-sm">🔊</button>
                        </div>
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-accent-indigo to-indigo-500 rounded-2xl shadow-2xl shadow-purple-500/20 p-6 flex flex-col justify-between" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                        <div className="flex justify-between items-start">
                            <h3 className="text-white text-2xl font-display font-bold flex-1 leading-tight">{meaning}</h3>
                            <StatusSelector />
                        </div>
                        {example && (
                            <div className="bg-black/15 p-3 rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm">
                                <p className="text-indigo-100 italic text-sm leading-snug line-clamp-3">
                                    <span className="font-bold not-italic text-white">Ví dụ:</span> {example}
                                </p>
                            </div>
                        )}
                        <div className="text-white text-[10px] opacity-40 text-center uppercase tracking-widest">Quay lại</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlashcardCard;