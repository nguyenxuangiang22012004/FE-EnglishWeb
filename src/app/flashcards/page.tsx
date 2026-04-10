'use client';

import { Header } from '@/components/layouts/Header';
import { FlashcardStudyPage } from '@/components/pages/FlashcardStudyPage';

export default function Page() {
    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <FlashcardStudyPage />
            </main>
        </>
    );
}
