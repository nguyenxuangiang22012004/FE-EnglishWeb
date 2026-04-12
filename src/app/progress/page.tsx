

import { Header } from '@/components/layouts/Header';
import { ProgressPage } from '@/components/pages/ProgressPage';

export default function Page() {
    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <ProgressPage />
            </main>
        </>
    );
}
