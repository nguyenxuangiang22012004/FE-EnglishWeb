'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { getFlashcardSetById } from '@/services/flashcardData';
import { StudySessionClient } from '@/components/pages/StudySessionClient';
import { notFound } from 'next/navigation';
import { FlashcardSet } from '@/store/slices/flashcardSlice';

export default function FlashcardStudyPage({ params }: { params: { id: string } }) {
    const [set, setSet] = useState<FlashcardSet | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSet = async () => {
            setIsLoading(true);
            const data = await getFlashcardSetById(params.id);
            setSet(data);
            setIsLoading(false);
        };
        fetchSet();
    }, [params.id]);

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex justify-center items-center h-full min-h-[50vh]">
                    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="ml-3 text-slate-400">Đang tải bộ từ vựng...</span>
                </div>
            </AppLayout>
        );
    }

    if (!set) {
        return notFound();
    }

    return (
        <AppLayout>
            <StudySessionClient initialSet={set} />
        </AppLayout>
    );
}
