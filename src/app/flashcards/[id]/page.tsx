import { AppLayout } from '@/components/layouts/AppLayout';
import { getFlashcardSets, getFlashcardSetById } from '@/services/flashcardData';
import { StudySessionClient } from '@/components/pages/StudySessionClient';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    const sets = await getFlashcardSets();
    return sets.map((set) => ({
        id: set.id,
    }));
}

export default async function FlashcardStudyPage({ params }: { params: { id: string } }) {
    const set = await getFlashcardSetById(params.id);

    if (!set) {
        notFound();
    }

    return (
        <AppLayout>
            <StudySessionClient initialSet={set} />
        </AppLayout>
    );
}
