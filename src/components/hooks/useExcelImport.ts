'use client';

import { useState, useCallback } from 'react';
import { AIVocabItem } from '@/services/importAIService';
import { previewExcelFile } from '@/services/excelImportService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExcelImportState {
    file: File | null;
    fileName: string;
    isLoading: boolean;
    error: string | null;
}

const INITIAL_STATE: ExcelImportState = {
    file: null,
    fileName: '',
    isLoading: false,
    error: null,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useExcelImport(onSuccess: (items: AIVocabItem[]) => void) {
    const [state, setState] = useState<ExcelImportState>(INITIAL_STATE);

    const handleFileSelect = useCallback((file: File) => {
        const name = file.name.toLowerCase();
        if (!name.endsWith('.xlsx') && !name.endsWith('.xls')) {
            setState((prev) => ({
                ...prev,
                error: 'Chỉ hỗ trợ file .xlsx hoặc .xls',
                file: null,
                fileName: '',
            }));
            return;
        }
        setState((prev) => ({
            ...prev,
            file,
            fileName: file.name,
            error: null,
        }));
    }, []);

    const handleRemoveFile = useCallback(() => {
        setState(INITIAL_STATE);
    }, []);

    const handlePreview = useCallback(async () => {
        if (!state.file) {
            setState((prev) => ({ ...prev, error: 'Vui lòng chọn file Excel trước.' }));
            return;
        }

        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const items = await previewExcelFile(state.file);
            setState((prev) => ({ ...prev, isLoading: false }));
            onSuccess(items);
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? (err as Error)?.message
                ?? 'Có lỗi xảy ra. Vui lòng thử lại.';
            setState((prev) => ({ ...prev, isLoading: false, error: msg }));
        }
    }, [state.file, onSuccess]);

    return {
        state,
        handleFileSelect,
        handleRemoveFile,
        handlePreview,
    };
}
