'use client';

import { useState, useCallback, useRef } from 'react';
import {
    generateVocabularyByTopic,
    generateVocabularyByImage,
    AIVocabItem,
} from '@/services/importAIService';

// ─── Types ────────────────────────────────────────────────────────────────────

type AITab = 'topic' | 'image';

interface AIImportState {
    activeTab: AITab;
    // Topic tab
    topic: string;
    wordCount: number;
    wordCountRaw: string;       // raw string while user is typing
    wordCountError: string | null;
    // Image tab
    imageFile: File | null;
    imagePreview: string;
    imageBase64: string;
    imageMimeType: string;
    // Shared
    isLoading: boolean;
    error: string | null;
}

const INITIAL_STATE: AIImportState = {
    activeTab: 'topic',
    topic: '',
    wordCount: 10,
    wordCountRaw: '10',
    wordCountError: null,
    imageFile: null,
    imagePreview: '',
    imageBase64: '',
    imageMimeType: '',
    isLoading: false,
    error: null,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAIImport(
    onSuccess: (items: AIVocabItem[]) => void,
) {
    const [state, setState] = useState<AIImportState>(INITIAL_STATE);
    const abortRef = useRef<AbortController | null>(null);

    // ── Helpers ──────────────────────────────────────────────────────────────

    const setError = (error: string | null) =>
        setState((prev) => ({ ...prev, error, isLoading: false }));

    const setLoading = (isLoading: boolean) =>
        setState((prev) => ({ ...prev, isLoading, error: null }));

    // ── Tab ──────────────────────────────────────────────────────────────────

    const setActiveTab = useCallback((activeTab: AITab) => {
        setState((prev) => ({ ...prev, activeTab, error: null }));
    }, []);

    // ── Topic tab ─────────────────────────────────────────────────────────────

    const handleTopicChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setState((prev) => ({ ...prev, topic: e.target.value }));
        },
        [],
    );

    const handleWordCountChange = useCallback((raw: string) => {
        const num = parseInt(raw, 10);
        const isValid = !isNaN(num) && num >= 5 && num <= 200;
        setState((prev) => ({
            ...prev,
            wordCountRaw: raw,
            wordCount: isValid ? num : prev.wordCount,
            wordCountError: raw === ''
                ? 'Vui lòng nhập số từ'
                : isNaN(num)
                ? 'Chỉ được nhập số'
                : num < 5
                ? 'Tối thiểu 5 từ'
                : num > 200
                ? 'Tối đa 200 từ'
                : null,
        }));
    }, []);

    const generateFromTopic = useCallback(async () => {
        const { topic, wordCount, wordCountError, wordCountRaw } = state;
        if (!topic.trim()) {
            setError('Vui lòng nhập chủ đề từ vựng.');
            return;
        }
        if (wordCountError || !wordCountRaw) {
            setError('Vui lòng nhập số từ hợp lệ (5 – 200).');
            return;
        }

        abortRef.current?.abort();
        abortRef.current = new AbortController();
        setLoading(true);

        try {
            const items = await generateVocabularyByTopic(
                topic.trim(),
                wordCount,
                abortRef.current.signal,
            );
            setState((prev) => ({ ...prev, isLoading: false, error: null }));
            onSuccess(items);
        } catch (err: unknown) {
            if ((err as Error)?.name === 'AbortError') return;
            setError(
                (err as Error)?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.',
            );
        }
    }, [state, onSuccess]);

    // ── Image tab ─────────────────────────────────────────────────────────────

    const handleImageSelect = useCallback(
        (file: File) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                // dataUrl: "data:image/jpeg;base64,xxxx"
                const [meta, base64] = dataUrl.split(',');
                const mimeType = meta.split(':')[1].split(';')[0];
                setState((prev) => ({
                    ...prev,
                    imageFile: file,
                    imagePreview: dataUrl,
                    imageBase64: base64,
                    imageMimeType: mimeType,
                    error: null,
                }));
            };
            reader.readAsDataURL(file);
        },
        [],
    );

    const handleRemoveImage = useCallback(() => {
        setState((prev) => ({
            ...prev,
            imageFile: null,
            imagePreview: '',
            imageBase64: '',
            imageMimeType: '',
            error: null,
        }));
    }, []);

    const generateFromImage = useCallback(async () => {
        const { imageBase64, imageMimeType, wordCount, wordCountError, wordCountRaw } = state;
        if (!imageBase64) {
            setError('Vui lòng chọn hoặc kéo thả một hình ảnh.');
            return;
        }
        if (wordCountError || !wordCountRaw) {
            setError('Vui lòng nhập số từ hợp lệ (5 – 200).');
            return;
        }

        abortRef.current?.abort();
        abortRef.current = new AbortController();
        setLoading(true);

        try {
            const items = await generateVocabularyByImage(
                imageBase64,
                imageMimeType,
                wordCount,
                abortRef.current.signal,
            );
            setState((prev) => ({ ...prev, isLoading: false, error: null }));
            onSuccess(items);
        } catch (err: unknown) {
            if ((err as Error)?.name === 'AbortError') return;
            setError(
                (err as Error)?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.',
            );
        }
    }, [state, onSuccess]);

    // ── Cancel ────────────────────────────────────────────────────────────────

    const cancelGeneration = useCallback(() => {
        abortRef.current?.abort();
        setState((prev) => ({ ...prev, isLoading: false }));
    }, []);

    return {
        state,
        setActiveTab,
        handleTopicChange,
        handleWordCountChange,
        generateFromTopic,
        handleImageSelect,
        handleRemoveImage,
        generateFromImage,
        cancelGeneration,
    };
}
