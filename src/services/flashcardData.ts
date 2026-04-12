import { FlashcardSet } from '@/store/slices/flashcardSlice';

// Mock data (extracted from slice)
export const mockSets: FlashcardSet[] = [
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
      name: 'Tiếng Anh Nâng Cao', // changed slightly to differentiate from set-1
      description: 'Các từ vựng nâng cao',
      emoji: '🌟',
      createdAt: new Date().toISOString(),
      cards: [
        { id: 'c10', word: 'Phenomenon', meaning: 'Hiện tượng', pronunciation: '/fəˈnɒm.ɪ.nən/', status: 'mastered' },
        { id: 'c11', word: 'Synchronize', meaning: 'Đồng bộ hóa', pronunciation: '/ˈsɪŋ.krə.naɪz/', status: 'learning' },
        { id: 'c12', word: 'Catastrophe', meaning: 'Thảm họa', pronunciation: '/kəˈtæs.trə.fi/', status: 'unknown' },
      ],
    },
  ];

// Simulate an API call to get all flashcard sets
export const getFlashcardSets = async (): Promise<FlashcardSet[]> => {
    // delay for simulating network request (optional, can be very fast since it's SSG/SSR)
    return mockSets;
};

// Simulate an API call to get a single flashcard set by ID
export const getFlashcardSetById = async (id: string): Promise<FlashcardSet | null> => {
    const set = mockSets.find(s => s.id === id);
    return set || null;
};
