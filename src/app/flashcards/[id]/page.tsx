import { Header } from '@/components/layouts/Header';
import { getFlashcardSets, getFlashcardSetById } from '@/services/flashcardData';
import { StudySessionClient } from '@/components/pages/StudySessionClient';
import { notFound } from 'next/navigation';

// Next.js will pre-render exactly these sets at build time (SSG)
export async function generateStaticParams() {
    const sets = await getFlashcardSets();
    return sets.map((set) => ({
        id: set.id,
    }));
}

export default async function FlashcardStudyPage({ params }: { params: { id: string } }) {
    // Fetch individual set in the Server Component
    const set = await getFlashcardSetById(params.id);

    if (!set) {
        notFound();
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50/50">
                <StudySessionClient initialSet={set} />
            </main>
        </>
    );
}
