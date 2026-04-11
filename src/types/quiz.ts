export interface Question {
    cardId: string;
    word: string;
    pronunciation?: string;
    options: string[];
    correctIndex: number;
}
