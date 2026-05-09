import { AppLayout } from '@/components/layouts/AppLayout';
import { getFlashcardSets } from '@/services/flashcardData';
import { FlashcardSetList } from '@/components/ui/flashcard/FlashcardSetList';
import { CreateSetModalCoordinator } from '@/components/ui/flashcard/CreateSetModalCoordinator';

export default async function FlashcardsPage() {
    // Fetch data directly in the Server Component
    const sets = await getFlashcardSets();

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-display font-bold text-slate-100">📚 Học Flashcard</h1>
                    <CreateSetModalCoordinator />
                </div>
                <p className="text-slate-400">Chọn một bộ flashcard để bắt đầu học:</p>
                <FlashcardSetList sets={sets} />
            </div>
        </AppLayout>
    );
}
