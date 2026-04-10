'use client';

import { Header } from '@/components/layouts/Header';
import { Dashboard } from '@/components/pages/Dashboard';

export default function Home() {
    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <Dashboard />
            </main>
        </>
    );
}
