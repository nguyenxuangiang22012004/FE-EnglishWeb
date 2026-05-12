'use client';

import React from 'react';

type Status = 'unknown' | 'learning' | 'mastered';

interface FlashcardProps {
    word: string;
    meaning: string;
    pronunciation?: string;
    partOfSpeech?: string;
    example?: string;
    image?: string;
    isFlipped?: boolean;
    status?: Status;
    onFlip?: () => void;
    onPlaySound?: () => void;
    onStatusChange?: (newStatus: Status) => void;
    onNext?: () => void;
}

export const FlashcardCard: React.FC<FlashcardProps> = ({ word, meaning, pronunciation, partOfSpeech, example, image, isFlipped = false, status = 'unknown', onFlip, onPlaySound, onStatusChange, onNext }) => {
    const STATUS_MAP: Record<Status, { label: string; color: string; border: string; bg: string; hover: string }> = {
        unknown: { label: 'Chưa biết', color: '#fb7185', border: 'border-rose-500/30', bg: 'bg-rose-500/10', hover: 'hover:bg-rose-500/20' },
        learning: { label: 'Đang học', color: '#fbbf24', border: 'border-amber-400/30', bg: 'bg-amber-400/10', hover: 'hover:bg-amber-400/20' },
        mastered: { label: 'Đã thuộc', color: '#34d399', border: 'border-emerald-400/30', bg: 'bg-emerald-400/10', hover: 'hover:bg-emerald-400/20' },
    };

    const handleStatusClick = (e: React.MouseEvent, newStatus: Status) => {
        e.stopPropagation();
        if (onStatusChange) onStatusChange(newStatus);
        if (onNext) onNext();
    };

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="w-full max-w-md h-[22rem] cursor-pointer select-none" style={{ perspective: '1200px' }} onClick={onFlip}>
                <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)', transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)' }}>
                    {/* Front */}
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-indigo via-purple-600 to-accent-indigo-light rounded-[2rem] shadow-2xl shadow-accent-indigo/30 p-6 flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                        
                        <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: STATUS_MAP[status].color }} />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">{STATUS_MAP[status].label}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center w-full px-4">
                            <h3 className="text-white text-5xl md:text-6xl font-display font-bold drop-shadow-md tracking-tight mb-3">{word}</h3>
                            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                                {partOfSpeech && (
                                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest bg-accent-indigo-light/30 text-white px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-sm">
                                        {partOfSpeech}
                                    </span>
                                )}
                                {pronunciation && (
                                    <p className="text-indigo-200 text-lg md:text-xl font-mono opacity-90 bg-black/10 px-4 py-1 rounded-full border border-white/5">
                                        /{pronunciation.replace(/^\/|\/$/g, '')}/
                                    </p>
                                )}
                            </div>
                            {image && <div className="mt-4 w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center text-white/50 text-xs border border-white/10 shadow-inner backdrop-blur-sm">[Hình ảnh]</div>}
                        </div>
                        
                        <div className="absolute bottom-5 left-0 w-full px-6 flex justify-between items-end">
                            <span className="text-white/50 text-xs tracking-wider uppercase font-semibold flex items-center gap-1.5"><span className="text-base">👆</span> Chạm để lật thẻ</span>
                            <button onClick={(e) => { e.stopPropagation(); onPlaySound?.(); }} className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-full text-white text-2xl hover:bg-white/30 active:scale-95 transition-all shadow-lg backdrop-blur-md border border-white/10 hover:shadow-xl">🔊</button>
                        </div>
                    </div>
                    
                    {/* Back */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-accent-indigo to-indigo-500 rounded-[2rem] shadow-2xl shadow-purple-500/30 p-6 flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                        
                        <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: STATUS_MAP[status].color }} />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">{STATUS_MAP[status].label}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center w-full px-2">
                            <h3 className="text-white text-3xl md:text-4xl font-display font-bold leading-tight drop-shadow-md mb-4">{meaning}</h3>
                            {partOfSpeech && (
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest bg-white/10 text-white/80 px-2 py-0.5 rounded-md border border-white/5 mb-4">
                                    {partOfSpeech}
                                </span>
                            )}
                            
                            {example && (
                                <div className="bg-black/20 p-5 rounded-2xl border border-white/10 w-full max-w-sm backdrop-blur-md shadow-inner text-left relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent-emerald to-accent-cyan"></div>
                                    <span className="text-white/60 text-[10px] uppercase tracking-widest block mb-2 font-bold ml-1">Ví dụ</span>
                                    <p className="text-indigo-50 text-base md:text-lg leading-relaxed ml-1 font-medium">
                                        {example}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="absolute bottom-5 left-0 w-full px-6 flex justify-center items-end">
                            <span className="text-white/50 text-xs tracking-wider uppercase font-semibold flex items-center gap-1.5"><span className="text-base">👆</span> Chạm để lật thẻ</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Horizontal Status Buttons */}
            {isFlipped && (
                <div className="w-full max-w-md mt-6 flex items-center justify-between gap-3 animate-slideUp">
                    {(Object.keys(STATUS_MAP) as Status[]).map((s) => (
                        <button
                            key={s}
                            onClick={(e) => handleStatusClick(e, s)}
                            className={`flex-1 py-3.5 rounded-2xl border ${STATUS_MAP[s].border} ${STATUS_MAP[s].bg} ${STATUS_MAP[s].hover} transition-all active:scale-95 flex flex-col items-center justify-center gap-1 backdrop-blur-sm`}
                        >
                            <span className="text-sm font-bold text-white uppercase tracking-wide drop-shadow-md">{STATUS_MAP[s].label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FlashcardCard;