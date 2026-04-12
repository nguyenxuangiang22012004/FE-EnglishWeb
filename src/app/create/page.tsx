

import { Header } from '@/components/layouts/Header';
import { CreateFlashcardPage } from '@/components/pages/CreateFlashcardPage';

export default function Page() {
    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <CreateFlashcardPage />
            </main>
        </>
    );
}
