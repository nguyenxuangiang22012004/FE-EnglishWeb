import axios from '@/config/axios';

export interface FlashcardSetPayload {
    name: string;
    description?: string;
    emoji?: string;
    isPublic?: boolean;
}

export interface FlashcardCardPayload {
    word: string;
    meaning: string;
    pronunciation?: string;
    partOfSpeech?: string;
    example?: string;
}

export interface FlashcardCardResponse {
    id: string;
    word: string;
    meaning: string;
    pronunciation?: string;
    partOfSpeech?: string;
    example?: string;
    createdAt: string;
    status: 'UNKNOWN' | 'LEARNING' | 'MASTERED';
}

export interface FlashcardSetResponse {
    id: string;
    name: string;
    description?: string;
    emoji?: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    totalCards: number;
    cards: FlashcardCardResponse[];
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const flashcardService = {
    // ========== SETS ==========
    createSet: async (payload: FlashcardSetPayload): Promise<ApiResponse<FlashcardSetResponse>> => {
        const res = await axios.post('/flashcards/sets', payload);
        return res.data;
    },

    getMySets: async (): Promise<ApiResponse<FlashcardSetResponse[]>> => {
        const res = await axios.get('/flashcards/sets');
        return res.data;
    },

    getSetById: async (setId: string, status?: string): Promise<ApiResponse<FlashcardSetResponse>> => {
        const query = status && status !== 'all' ? `?status=${status}` : '';
        const res = await axios.get(`/flashcards/sets/${setId}${query}`);
        return res.data;
    },

    deleteSet: async (setId: string): Promise<ApiResponse<null>> => {
        const res = await axios.delete(`/flashcards/sets/${setId}`);
        return res.data;
    },

    updateSet: async (setId: string, payload: Partial<FlashcardSetPayload>): Promise<ApiResponse<FlashcardSetResponse>> => {
        const res = await axios.put(`/flashcards/sets/${setId}`, payload);
        return res.data;
    },

    // ========== CARDS ==========
    addCardsToSet: async (
        setId: string,
        cards: FlashcardCardPayload[]
    ): Promise<ApiResponse<FlashcardCardResponse[]>> => {
        const res = await axios.post(`/flashcards/sets/${setId}/cards`, cards);
        return res.data;
    },

    getCardsInSet: async (setId: string): Promise<ApiResponse<FlashcardCardResponse[]>> => {
        const res = await axios.get(`/flashcards/sets/${setId}/cards`);
        return res.data;
    },

    deleteCard: async (setId: string, cardId: string): Promise<ApiResponse<null>> => {
        const res = await axios.delete(`/flashcards/sets/${setId}/cards/${cardId}`);
        return res.data;
    },

    updateCardProgress: async (cardId: string, status: 'UNKNOWN' | 'LEARNING' | 'MASTERED'): Promise<ApiResponse<any>> => {
        const res = await axios.put(`/flashcards/cards/${cardId}/progress`, { status });
        return res.data;
    },
};

export default flashcardService;
