'use client';

import { Header } from '@/components/layouts/Header';
import { ImportVocabularyPage } from '@/components/pages';

export default function Page() {
    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <ImportVocabularyPage />
            </main>
        </>
    );
}
