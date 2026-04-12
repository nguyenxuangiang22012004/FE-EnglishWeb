

import { Header } from '@/components/layouts/Header';
import { AILookupPage } from '@/components/pages/AILookupPage';

export default function Page() {
    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <AILookupPage />
            </main>
        </>
    );
}
