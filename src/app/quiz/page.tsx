'use client';

import { Header } from '@/components/layouts/Header';
import { QuizPage } from '@/components/pages/QuizPage';

export default function Page() {
    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-4 py-6">
                <QuizPage />
            </main>
        </>
    );
}
