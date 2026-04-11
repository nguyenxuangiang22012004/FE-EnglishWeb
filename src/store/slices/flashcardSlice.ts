// store/slices/flashcardSlice.ts
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

export interface FlashcardSet {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  cards: Flashcard[];
  createdAt?: string;
}

export interface FlashcardState {
  sets: FlashcardSet[];
  cards: Flashcard[]; // legacy / standalone cards
  currentIndex: number;
  currentSetId: string | null;
}

const initialState: FlashcardState = {
  sets: [
    // Seed data để test
    {
      id: 'set-1',
      name: 'Tiếng Anh Cơ Bản',
      description: 'Các từ vựng thông dụng hàng ngày',
      emoji: '🌟',
      createdAt: new Date().toISOString(),
      cards: [
        { id: 'c1', word: 'Apple', meaning: 'Quả táo', pronunciation: '/ˈæp.əl/', status: 'mastered' },
        { id: 'c2', word: 'Book', meaning: 'Quyển sách', pronunciation: '/bʊk/', status: 'learning' },
        { id: 'c3', word: 'Cat', meaning: 'Con mèo', pronunciation: '/kæt/', status: 'unknown' },
      ],
    },
    {
      id: 'set-2',
      name: 'IELTS Vocabulary',
      description: 'Từ vựng luyện thi IELTS Band 7+',
      emoji: '📚',
      createdAt: new Date().toISOString(),
      cards: [
        { id: 'c4', word: 'Ambiguous', meaning: 'Mơ hồ, không rõ ràng', pronunciation: '/æmˈbɪɡ.ju.əs/', status: 'unknown' },
        { id: 'c5', word: 'Eloquent', meaning: 'Hùng hồn, lưu loát', pronunciation: '/ˈel.ə.kwənt/', status: 'learning' },
      ],
    },
    {
      id: 'set-3',
      name: 'Tiếng Nhật N5',
      description: 'Từ vựng JLPT N5 cơ bản',
      emoji: '🇯🇵',
      createdAt: new Date().toISOString(),
      cards: [
        { id: 'c6', word: 'ありがとう', meaning: 'Cảm ơn', pronunciation: 'Arigatou', status: 'mastered' },
        { id: 'c7', word: 'すみません', meaning: 'Xin lỗi / Excuse me', pronunciation: 'Sumimasen', status: 'mastered' },
        { id: 'c8', word: 'おはよう', meaning: 'Chào buổi sáng', pronunciation: 'Ohayou', status: 'learning' },
        { id: 'c9', word: 'こんにちは', meaning: 'Xin chào (ban ngày)', pronunciation: 'Konnichiwa', status: 'unknown' },
      ],
    },
    {
      id: 'set-4',
      name: 'Tiếng Anh Cơ Bản',
      description: 'Các từ vựng thông dụng hàng ngày',
      emoji: '🌟',
      createdAt: new Date().toISOString(),
      cards: [
        { id: 'c1', word: 'Apple', meaning: 'Quả táo', pronunciation: '/ˈæp.əl/', status: 'mastered' },
        { id: 'c2', word: 'Book', meaning: 'Quyển sách', pronunciation: '/bʊk/', status: 'learning' },
        { id: 'c3', word: 'Cat', meaning: 'Con mèo', pronunciation: '/kæt/', status: 'unknown' },
      ],
    },
  ],
  cards: [],
  currentIndex: 0,
  currentSetId: null,
};

const flashcardSlice = createSlice({
  name: 'flashcard',
  initialState,
  reducers: {
    // --- Set actions ---
    addSet: (state, action: PayloadAction<Omit<FlashcardSet, 'id' | 'createdAt'>>) => {
      state.sets.push({
        ...action.payload,
        id: `set-${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
    },
    deleteSet: (state, action: PayloadAction<string>) => {
      state.sets = state.sets.filter((s) => s.id !== action.payload);
      if (state.currentSetId === action.payload) state.currentSetId = null;
    },
    selectSet: (state, action: PayloadAction<string | null>) => {
      state.currentSetId = action.payload;
      state.currentIndex = 0;
    },

    // --- Card actions (scoped to a set) ---
    addFlashcardsToSet: (
      state,
      action: PayloadAction<{ setId: string; cards: Flashcard[] }>
    ) => {
      const set = state.sets.find((s) => s.id === action.payload.setId);
      if (set) {
        set.cards.push(
          ...action.payload.cards.map((c) => ({
            ...c,
            id: c.id || `card-${Date.now()}-${Math.random()}`,
            status: c.status || 'unknown',
          }))
        );
      }
    },
    updateFlashcardStatus: (
      state,
      action: PayloadAction<{ id: string; status: 'unknown' | 'learning' | 'mastered' }>
    ) => {
      for (const set of state.sets) {
        const card = set.cards.find((c) => c.id === action.payload.id);
        if (card) { card.status = action.payload.status; break; }
      }
    },

    // --- Navigation ---
    setCurrentIndex: (state, action: PayloadAction<number>) => {
      state.currentIndex = action.payload;
    },

    // --- Legacy standalone cards ---
    addFlashcards: (state, action: PayloadAction<Flashcard[]>) => {
      state.cards.push(...action.payload);
    },
    addFlashcard: (state, action: PayloadAction<Flashcard>) => {
      state.cards.push({ ...action.payload, id: action.payload.id || `card-${Date.now()}` });
    },
    updateFlashcard: (state, action: PayloadAction<Flashcard>) => {
      const index = state.cards.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) state.cards[index] = { ...state.cards[index], ...action.payload };
    },
    deleteFlashcard: (state, action: PayloadAction<string>) => {
      state.cards = state.cards.filter((c) => c.id !== action.payload);
      if (state.currentIndex >= state.cards.length && state.currentIndex > 0) state.currentIndex--;
    },
    clearFlashcards: (state) => { state.cards = []; state.currentIndex = 0; },
  },
});

export const {
  addSet, deleteSet, selectSet,
  addFlashcardsToSet, updateFlashcardStatus,
  setCurrentIndex,
  addFlashcards, addFlashcard, updateFlashcard, deleteFlashcard, clearFlashcards,
} = flashcardSlice.actions;

export default flashcardSlice.reducer;