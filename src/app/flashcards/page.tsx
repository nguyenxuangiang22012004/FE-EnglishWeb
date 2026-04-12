import { Header } from '@/components/layouts/Header';
import { getFlashcardSets } from '@/services/flashcardData';
import { FlashcardSetList } from '@/components/ui/flashcard/FlashcardSetList';
import { CreateSetModalCoordinator } from '@/components/ui/flashcard/CreateSetModalCoordinator';

export default async function FlashcardsPage() {
    // Fetch data directly in the Server Component (SSR / SSG depending on Next.js config)
    const sets = await getFlashcardSets();

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50/50">
                <div className="max-w-6xl mx-auto space-y-6 p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-4xl font-bold text-gray-800">📚 Học Flashcard</h1>
                        <CreateSetModalCoordinator />
                    </div>
                    <p className="text-gray-500">Chọn một bộ flashcard để bắt đầu học:</p>
                    
                    <FlashcardSetList sets={sets} />
                </div>
            </main>
        </>
    );
}
