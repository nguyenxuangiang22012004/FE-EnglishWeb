import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Flashcard {
  id: string;
  word: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
  createdAt?: string;
  status?: 'unknown' | 'learning' | 'mastered';
}

export interface FlashcardState {
  cards: Flashcard[];
  currentIndex: number;
}

const initialState: FlashcardState = {
  cards: [],
  currentIndex: 0,
};

const flashcardSlice = createSlice({
  name: 'flashcard',
  initialState,
  reducers: {
    // Add new flashcards
    addFlashcards: (state, action: PayloadAction<Flashcard[]>) => {
      const newCards = action.payload.map((card) => ({
        ...card,
        id: card.id || `card-${Date.now()}-${Math.random()}`,
        createdAt: card.createdAt || new Date().toISOString(),
        status: card.status || 'unknown',
      }));
      state.cards.push(...newCards);
    },

    // Add single flashcard
    addFlashcard: (state, action: PayloadAction<Flashcard>) => {
      const card = {
        ...action.payload,
        id: action.payload.id || `card-${Date.now()}`,
        createdAt: action.payload.createdAt || new Date().toISOString(),
        status: action.payload.status || 'unknown',
      };
      state.cards.push(card);
    },

    // Update flashcard
    updateFlashcard: (state, action: PayloadAction<Flashcard>) => {
      const index = state.cards.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.cards[index] = { ...state.cards[index], ...action.payload };
      }
    },

    // Delete flashcard
    deleteFlashcard: (state, action: PayloadAction<string>) => {
      state.cards = state.cards.filter((c) => c.id !== action.payload);
      if (state.currentIndex >= state.cards.length && state.currentIndex > 0) {
        state.currentIndex--;
      }
    },

    // Set current index
    setCurrentIndex: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.cards.length) {
        state.currentIndex = action.payload;
      }
    },

    // Clear all flashcards
    clearFlashcards: (state) => {
      state.cards = [];
      state.currentIndex = 0;
    },

    // Update flashcard status
    updateFlashcardStatus: (
      state,
      action: PayloadAction<{ id: string; status: 'unknown' | 'learning' | 'mastered' }>
    ) => {
      const card = state.cards.find((c) => c.id === action.payload.id);
      if (card) {
        card.status = action.payload.status;
      }
    },
  },
});

export const {
  addFlashcards,
  addFlashcard,
  updateFlashcard,
  deleteFlashcard,
  setCurrentIndex,
  clearFlashcards,
  updateFlashcardStatus,
} = flashcardSlice.actions;

export default flashcardSlice.reducer;
