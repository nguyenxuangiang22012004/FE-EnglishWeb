export interface Question {
    cardId: string;
    word: string;
    pronunciation?: string;
    partOfSpeech?: string;
    options: string[];
    correctIndex: number;
}
