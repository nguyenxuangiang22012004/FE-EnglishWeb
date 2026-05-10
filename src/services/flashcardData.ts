import { FlashcardSet } from '@/store/slices/flashcardSlice';
import flashcardService, { FlashcardSetResponse } from '@/services/flashcardService';

/**
 * Convert API FlashcardSetResponse to local FlashcardSet shape (compatible with Redux/UI)
 */
const toLocalSet = (apiSet: FlashcardSetResponse): FlashcardSet => ({
    id: apiSet.id,
    name: apiSet.name,
    description: apiSet.description,
    emoji: apiSet.emoji,
    createdAt: apiSet.createdAt,
    cards: (apiSet.cards || []).map(card => ({
        id: card.id,
        word: card.word,
        meaning: card.meaning,
        pronunciation: card.pronunciation,
        example: card.example,
        createdAt: card.createdAt,
        status: (card.status || 'unknown').toLowerCase() as any,
    })),
});

// Fetch all sets belonging to the logged-in user
export const getFlashcardSets = async (): Promise<FlashcardSet[]> => {
    try {
        const res = await flashcardService.getMySets();
        if (res.success && res.data) {
            return res.data.map(toLocalSet);
        }
        return [];
    } catch {
        return [];
    }
};

// Fetch a single set by ID
export const getFlashcardSetById = async (id: string): Promise<FlashcardSet | null> => {
    try {
        const res = await flashcardService.getSetById(id);
        if (res.success && res.data) {
            return toLocalSet(res.data);
        }
        return null;
    } catch {
        return null;
    }
};
