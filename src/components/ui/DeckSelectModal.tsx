'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    X,
    Loader2,
    BookOpen,
    Plus,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
} from 'lucide-react';
import flashcardService, {
    FlashcardCardPayload,
    FlashcardSetResponse,
} from '@/services/flashcardService';

interface DeckSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    cards: FlashcardCardPayload[];
    onSuccess: () => void;
    redirectOnSuccess?: boolean;
}

type ModalView = 'select' | 'create';
type ModalStatus = 'idle' | 'loading-sets' | 'creating' | 'importing' | 'success' | 'error';

const EMOJI_OPTIONS = ['📖', '📚', '🎓', '🌍', '💼', '🔬', '🎯', '🚀', '💡', '🎨', '🏆', '⭐'];

/* ─── Create Deck Form ──────────────────────────────────── */

interface CreateDeckFormProps {
    onBack: () => void;
    onCreated: (set: FlashcardSetResponse) => void;
    status: ModalStatus;
    errorMessage: string;
    onStatusChange: (status: ModalStatus) => void;
    onErrorChange: (msg: string) => void;
}

const CreateDeckForm: React.FC<CreateDeckFormProps> = ({
    onBack,
    onCreated,
    status,
    errorMessage,
    onStatusChange,
    onErrorChange,
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [emoji, setEmoji] = useState('📖');

    const isCreating = status === 'creating';

    const handleCreate = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            onErrorChange('Vui lòng nhập tên bộ từ vựng');
            onStatusChange('error');
            return;
        }

        onStatusChange('creating');
        onErrorChange('');

        try {
            const res = await flashcardService.createSet({
                name: trimmedName,
                description: description.trim() || undefined,
                emoji,
            });

            if (res.success && res.data) {
                onCreated(res.data);
            } else {
                onStatusChange('error');
                onErrorChange(res.message || 'Tạo bộ từ vựng thất bại');
            }
        } catch {
            onStatusChange('error');
            onErrorChange('Lỗi kết nối. Vui lòng thử lại.');
        }
    };

    return (
        <div className="space-y-5">
            {/* Back button */}
            <button
                onClick={onBack}
                disabled={isCreating}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40"
            >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
            </button>

            {/* Error */}
            {status === 'error' && errorMessage && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/20 animate-fadeIn">
                    <AlertCircle className="w-5 h-5 text-accent-rose flex-shrink-0" />
                    <p className="text-sm text-accent-rose">{errorMessage}</p>
                </div>
            )}

            {/* Emoji picker */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Biểu tượng
                </label>
                <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map((e) => (
                        <button
                            key={e}
                            type="button"
                            onClick={() => setEmoji(e)}
                            disabled={isCreating}
                            className={`
                                w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all
                                ${emoji === e
                                    ? 'bg-accent-indigo/20 border-2 border-accent-indigo/50 scale-110'
                                    : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08]'
                                }
                                disabled:opacity-40
                            `}
                        >
                            {e}
                        </button>
                    ))}
                </div>
            </div>

            {/* Name input */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tên bộ từ vựng <span className="text-accent-rose">*</span>
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: IELTS Vocabulary, Giao tiếp cơ bản..."
                    disabled={isCreating}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-accent-indigo/40 focus:ring-1 focus:ring-accent-indigo/20 transition-all disabled:opacity-40"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isCreating) {
                            handleCreate();
                        }
                    }}
                />
            </div>

            {/* Description input */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mô tả (tùy chọn)
                </label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả ngắn về bộ từ vựng..."
                    disabled={isCreating}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-accent-indigo/40 focus:ring-1 focus:ring-accent-indigo/20 transition-all disabled:opacity-40"
                />
            </div>

            {/* Create button */}
            <button
                onClick={handleCreate}
                disabled={isCreating || !name.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-accent-indigo to-accent-violet text-white font-bold text-sm transition-all hover:shadow-lg hover:shadow-accent-indigo/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {isCreating ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang tạo bộ từ...
                    </>
                ) : (
                    <>
                        <Plus className="w-4 h-4" />
                        Tạo bộ từ vựng
                    </>
                )}
            </button>
        </div>
    );
};

/* ─── Main Modal ─────────────────────────────────────────── */

export const DeckSelectModal: React.FC<DeckSelectModalProps> = ({
    isOpen,
    onClose,
    cards,
    onSuccess,
    redirectOnSuccess = true,
}) => {
    const router = useRouter();
    const [sets, setSets] = useState<FlashcardSetResponse[]>([]);
    const [view, setView] = useState<ModalView>('select');
    const [status, setStatus] = useState<ModalStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
    const [successSetName, setSuccessSetName] = useState('');

    useEffect(() => {
        if (!isOpen) {
            resetState();
            return;
        }

        fetchSets();
    }, [isOpen]);

    const resetState = () => {
        setView('select');
        setStatus('idle');
        setErrorMessage('');
        setSelectedSetId(null);
        setSuccessSetName('');
    };

    const fetchSets = async () => {
        setStatus('loading-sets');
        try {
            const res = await flashcardService.getMySets();
            if (res.success && res.data) {
                setSets(res.data);
            } else {
                setSets([]);
            }
            setStatus('idle');
        } catch {
            setSets([]);
            setStatus('error');
            setErrorMessage('Không thể tải danh sách bộ từ vựng');
        }
    };

    const importCardsToSet = async (setId: string, setName: string) => {
        setSelectedSetId(setId);
        setStatus('importing');
        setErrorMessage('');

        try {
            const res = await flashcardService.addCardsToSet(setId, cards);
            if (res.success) {
                setSuccessSetName(setName);
                setStatus('success');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                    if (redirectOnSuccess) {
                        router.push('/flashcards');
                    }
                }, 1500);
            } else {
                setStatus('error');
                setErrorMessage(res.message || 'Thêm từ thất bại');
                setSelectedSetId(null);
            }
        } catch {
            setStatus('error');
            setErrorMessage('Lỗi kết nối. Vui lòng thử lại.');
            setSelectedSetId(null);
        }
    };

    const handleSelectExistingDeck = async (set: FlashcardSetResponse) => {
        if (status === 'importing') return;
        await importCardsToSet(set.id, set.name);
    };

    const handleDeckCreated = async (newSet: FlashcardSetResponse) => {
        // Deck created successfully → now auto-import cards
        await importCardsToSet(newSet.id, newSet.name);
    };

    const handleSwitchToCreate = () => {
        setView('create');
        setStatus('idle');
        setErrorMessage('');
    };

    const handleBackToSelect = () => {
        setView('select');
        setStatus('idle');
        setErrorMessage('');
    };

    if (!isOpen) return null;

    const headerTitle = view === 'create' ? 'Tạo bộ từ vựng mới' : 'Chọn bộ từ vựng';
    const headerSubtitle = view === 'create'
        ? 'Tạo bộ trước, sau đó thêm từ vựng'
        : `Thêm ${cards.length} từ vào bộ`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-lg bg-surface-800 border border-white/[0.08] rounded-2xl shadow-2xl animate-fadeInScale overflow-hidden"
                style={{ background: 'var(--bg-secondary)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center">
                            {view === 'create' ? (
                                <Plus className="w-5 h-5 text-accent-indigo-light" />
                            ) : (
                                <BookOpen className="w-5 h-5 text-accent-indigo-light" />
                            )}
                        </div>
                        <div>
                            <h2 className="font-display font-bold text-slate-100 text-lg">
                                {headerTitle}
                            </h2>
                            <p className="text-xs text-slate-400">
                                {headerSubtitle}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors text-slate-400 hover:text-slate-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-4 max-h-[400px] overflow-y-auto">
                    {/* ── Success state (shared) ── */}
                    {status === 'success' && (
                        <div className="flex flex-col items-center justify-center py-10 gap-3 animate-fadeInScale">
                            <div className="w-16 h-16 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-accent-emerald" />
                            </div>
                            <p className="text-lg font-display font-bold text-slate-100">
                                Thêm thành công!
                            </p>
                            <p className="text-sm text-slate-400">
                                Đã thêm {cards.length} từ vào{' '}
                                <span className="text-accent-indigo-light font-medium">
                                    {successSetName}
                                </span>
                            </p>
                        </div>
                    )}

                    {/* ── Importing state ── */}
                    {status === 'importing' && view === 'create' && (
                        <div className="flex flex-col items-center justify-center py-10 gap-3 animate-fadeIn">
                            <Loader2 className="w-10 h-10 text-accent-indigo-light animate-spin" />
                            <p className="text-sm text-slate-400">
                                Đang thêm {cards.length} từ vào bộ...
                            </p>
                        </div>
                    )}

                    {/* ── CREATE VIEW ── */}
                    {view === 'create' && status !== 'success' && status !== 'importing' && (
                        <CreateDeckForm
                            onBack={handleBackToSelect}
                            onCreated={handleDeckCreated}
                            status={status}
                            errorMessage={errorMessage}
                            onStatusChange={setStatus}
                            onErrorChange={setErrorMessage}
                        />
                    )}

                    {/* ── SELECT VIEW ── */}
                    {view === 'select' && status !== 'success' && (
                        <>
                            {/* Loading skeleton */}
                            {status === 'loading-sets' && (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="h-[72px] rounded-xl bg-white/[0.04] animate-pulse"
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Error message */}
                            {status === 'error' && (
                                <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-accent-rose/10 border border-accent-rose/20 animate-fadeIn">
                                    <AlertCircle className="w-5 h-5 text-accent-rose flex-shrink-0" />
                                    <p className="text-sm text-accent-rose">{errorMessage}</p>
                                </div>
                            )}

                            {/* Empty state */}
                            {status === 'idle' && sets.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                                    <div className="text-5xl">📚</div>
                                    <p className="text-slate-400 text-sm">
                                        Bạn chưa có bộ từ vựng nào.
                                    </p>
                                    <button
                                        onClick={handleSwitchToCreate}
                                        className="mt-2 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-indigo/10 border border-accent-indigo/20 text-accent-indigo-light text-sm font-medium hover:bg-accent-indigo/20 transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Tạo bộ mới
                                    </button>
                                </div>
                            )}

                            {/* Deck list */}
                            {status !== 'loading-sets' && sets.length > 0 && (
                                <div className="space-y-2">
                                    {sets.map((set, idx) => {
                                        const isImporting =
                                            status === 'importing' &&
                                            selectedSetId === set.id;
                                        const isDisabled =
                                            status === 'importing' &&
                                            selectedSetId !== set.id;

                                        return (
                                            <button
                                                key={set.id}
                                                onClick={() => handleSelectExistingDeck(set)}
                                                disabled={isDisabled}
                                                className={`
                                                    w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left
                                                    animate-fadeIn stagger-${Math.min(idx + 1, 8)}
                                                    ${isImporting
                                                        ? 'border-accent-indigo/40 bg-accent-indigo/10'
                                                        : isDisabled
                                                            ? 'border-white/[0.04] bg-white/[0.02] opacity-40 cursor-not-allowed'
                                                            : 'border-white/[0.06] bg-white/[0.03] hover:border-accent-indigo/30 hover:bg-accent-indigo/[0.06] cursor-pointer'
                                                    }
                                                `}
                                            >
                                                {/* Emoji */}
                                                <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center text-2xl flex-shrink-0">
                                                    {set.emoji || '📖'}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-display font-semibold text-slate-100 truncate">
                                                        {set.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        {set.totalCards || 0} từ
                                                        {set.description && (
                                                            <span className="ml-2">
                                                                · {set.description}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>

                                                {/* Loading indicator */}
                                                {isImporting && (
                                                    <Loader2 className="w-5 h-5 text-accent-indigo-light animate-spin flex-shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer - show create new option in select view */}
                {view === 'select' &&
                    status !== 'loading-sets' &&
                    status !== 'success' &&
                    status !== 'importing' &&
                    sets.length > 0 && (
                        <div className="px-6 py-3 border-t border-white/[0.06]">
                            <button
                                onClick={handleSwitchToCreate}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-slate-400 hover:text-accent-indigo-light hover:bg-white/[0.04] transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Tạo bộ từ vựng mới
                            </button>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default DeckSelectModal;
