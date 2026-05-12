'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreateFlashcardForm } from '@/components/ui/flashcard/CreateFlashcardForm';
import flashcardService from '@/services/flashcardService';

export const CreateFlashcardPage: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const setId = searchParams.get('setId');

    const [setName, setSetName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (setId) {
            flashcardService.getSetById(setId)
                .then(res => { if (res.success) setSetName(res.data.name); })
                .catch(() => setErrorMsg('Không tìm thấy bộ từ, vui lòng thử lại.'));
        }
    }, [setId]);

    const handleSubmit = async (data: {
        word: string;
        meaning: string;
        pronunciation?: string;
        partOfSpeech?: string;
        example?: string;
    }[]) => {
        if (!setId) {
            setErrorMsg('Chưa chọn bộ từ! Vui lòng tạo hoặc chọn bộ từ trước.');
            return;
        }
        setIsLoading(true);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            const res = await flashcardService.addCardsToSet(setId, data.map(d => ({
                word: d.word,
                meaning: d.meaning,
                pronunciation: d.pronunciation,
                partOfSpeech: d.partOfSpeech,
                example: d.example,
            })));
            if (res.success) {
                setSuccessMsg(`✅ Đã lưu ${res.data.length} flashcard thành công!`);
                // Navigate back to flashcards list after a short delay
                setTimeout(() => router.push('/flashcards'), 1500);
            }
        } catch (err: any) {
            setErrorMsg(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-display font-bold text-slate-100">🆕 Tạo Flashcard</h1>
                {setName && (
                    <p className="text-slate-400 mt-1">
                        Thêm từ vào bộ: <span className="text-indigo-400 font-semibold">{setName}</span>
                    </p>
                )}
                {!setId && (
                    <p className="text-amber-400 mt-1 text-sm">
                        ⚠️ Chưa chọn bộ từ. <button onClick={() => router.push('/flashcards')} className="underline hover:text-amber-300">Quay lại chọn bộ từ</button>
                    </p>
                )}
            </div>

            {successMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-4 py-3 text-sm font-medium">
                    {successMsg}
                </div>
            )}
            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm font-medium">
                    {errorMsg}
                </div>
            )}

            <div className="w-full">
                <CreateFlashcardForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default CreateFlashcardPage;