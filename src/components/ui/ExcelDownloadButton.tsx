'use client';

import React, { useState } from 'react';
import flashcardService from '@/services/flashcardService';

interface ExcelDownloadButtonProps {
    setId: string;
    setName: string;
}

export const ExcelDownloadButton: React.FC<ExcelDownloadButtonProps> = ({
    setId,
    setName,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleExport = async () => {
        if (isLoading) return;
        setIsLoading(true);
        setIsSuccess(false);

        try {
            const safeFileName = setName.replace(/[^a-zA-Z0-9_\-\u00C0-\u024F\u1E00-\u1EFF ]/g, '').trim() || 'flashcards';
            await flashcardService.exportSetToExcel(setId, safeFileName);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 2500);
        } catch (error) {
            console.error('Xuất Excel thất bại:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            id={`export-excel-btn-${setId}`}
            onClick={handleExport}
            disabled={isLoading}
            title="Xuất danh sách từ vựng ra file Excel"
            className={`
                relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
                border transition-all duration-200 overflow-hidden
                disabled:cursor-not-allowed
                ${isSuccess
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-white/[0.04] border-white/[0.10] text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400'
                }
            `}
        >
            {isLoading ? (
                <>
                    <span className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-300 rounded-full animate-spin" />
                    <span>Đang xuất...</span>
                </>
            ) : isSuccess ? (
                <>
                    <CheckIcon />
                    <span>Đã tải xuống!</span>
                </>
            ) : (
                <>
                    <ExcelIcon />
                    <span>Xuất Excel</span>
                </>
            )}
        </button>
    );
};

const ExcelIcon: React.FC = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const CheckIcon: React.FC = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default ExcelDownloadButton;
