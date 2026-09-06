'use client';

import { useState, useCallback } from 'react';

export interface ParsedWord {
    id: string;
    word: string;
    meaning: string;
    pronunciation?: string;
    partOfSpeech?: string;
    example?: string;
    selected: boolean;
}

export interface ImportVocabularyState {
    rawText: string;
    parsedWords: ParsedWord[];
    selectedCount: number;
}

const INITIAL_STATE: ImportVocabularyState = {
    rawText: '',
    parsedWords: [],
    selectedCount: 0,
};

const parseTextInput = (text: string): ParsedWord[] => {
    const lines = text.split('\n').filter((line) => line.trim());
    const parsed: ParsedWord[] = [];

    lines.forEach((line, idx) => {
        let word = '';
        let meaning = '';

        if (line.includes('---') && line.includes('|')) return;

        if (line.includes('|') && !line.includes('---')) {
            const parts = line
                .split('|')
                .map((p) => p.trim())
                .filter((p) => p && !p.includes('---'));
            if (parts.length >= 2) {
                word = parts[0];
                meaning = parts.slice(1).join('|').trim();
            }
        } else if (
            line.includes('→') ||
            line.includes('->') ||
            line.includes(':') ||
            line.includes(' - ')
        ) {
            const separators = ['→', '->', ':', ' - '];
            for (const sep of separators) {
                if (line.includes(sep)) {
                    const parts = line.split(sep).map((p) => p.trim());
                    if (parts.length >= 2) {
                        word = parts[0];
                        meaning = parts.slice(1).join(sep).trim();
                        break;
                    }
                }
            }
        } else if (line.includes(',')) {
            const parts = line.split(',').map((p) => p.trim());
            if (parts.length >= 2) {
                word = parts[0];
                meaning = parts.slice(1).join(',').trim();
            }
        } else if (line.match(/^[\s]*[-*+]\s+/)) {
            const cleanLine = line.replace(/^[\s]*[-*+]\s+/, '');
            if (cleanLine.includes(':')) {
                const parts = cleanLine.split(':').map((p) => p.trim());
                if (parts.length >= 2) {
                    word = parts[0];
                    meaning = parts.slice(1).join(':').trim();
                }
            }
        }

        if (word && meaning) {
            parsed.push({
                id: `word-${idx}-${Date.now()}`,
                word: word.trim(),
                meaning: meaning.trim(),
                selected: true,
            });
        }
    });

    return parsed;
};

const parseJsonInput = (text: string): ParsedWord[] => {
    try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
            return data
                .filter(
                    (item) =>
                        item.word &&
                        (item.meaning || item.translation || item.definition),
                )
                .map((item, idx) => ({
                    id: `word-${idx}-${Date.now()}`,
                    word: item.word || '',
                    meaning:
                        item.meaning ||
                        item.translation ||
                        item.definition ||
                        '',
                    selected: true,
                }));
        }
    } catch {
        return [];
    }
    return [];
};

export function useImportVocabulary() {
    const [state, setState] = useState<ImportVocabularyState>(INITIAL_STATE);


    const handleTextChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const text = e.target.value;

            let parsed: ParsedWord[] = [];
            if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
                parsed = parseJsonInput(text);
            }
            if (parsed.length === 0) {
                parsed = parseTextInput(text);
            }

            setState({
                rawText: text,
                parsedWords: parsed,
                selectedCount: parsed.length,
            });
        },
        [],
    );

    /**
     * Populate parsed words from AI result (Topic or Image tab).
     * Accepts items with all flashcard fields.
     */
    const setWordsFromAI = useCallback(
        (
            items: { word: string; meaning: string; pronunciation?: string; partOfSpeech?: string; example?: string }[],
        ) => {
            const parsed: ParsedWord[] = items.map((item, idx) => ({
                id: `ai-word-${idx}-${Date.now()}`,
                word: item.word.trim(),
                meaning: item.meaning.trim(),
                pronunciation: item.pronunciation?.trim(),
                partOfSpeech: item.partOfSpeech?.trim(),
                example: item.example?.trim(),
                selected: true,
            }));
            setState({
                rawText: '',
                parsedWords: parsed,
                selectedCount: parsed.length,
            });
        },
        [],
    );

    const toggleWordSelection = useCallback((id: string) => {
        setState((prev) => {
            const updated = prev.parsedWords.map((w) =>
                w.id === id ? { ...w, selected: !w.selected } : w,
            );
            const count = updated.filter((w) => w.selected).length;
            return { ...prev, parsedWords: updated, selectedCount: count };
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        setState((prev) => {
            const allSelected = prev.parsedWords.every((w) => w.selected);
            const updated = prev.parsedWords.map((w) => ({
                ...w,
                selected: !allSelected,
            }));
            const count = updated.filter((w) => w.selected).length;
            return { ...prev, parsedWords: updated, selectedCount: count };
        });
    }, []);

    const clearAll = useCallback(() => {
        setState(INITIAL_STATE);
    }, []);

    const getSelectedCards = useCallback(() => {
        return state.parsedWords
            .filter((w) => w.selected)
            .map((w) => ({
                word: w.word,
                meaning: w.meaning,
                pronunciation: w.pronunciation || '',
                partOfSpeech: w.partOfSpeech || '',
                example: w.example || '',
            }));
    }, [state.parsedWords]);

    const allSelected =
        state.parsedWords.length > 0 &&
        state.parsedWords.every((w) => w.selected);

    return {
        state,
        allSelected,
        handleTextChange,
        setWordsFromAI,
        toggleWordSelection,
        toggleSelectAll,
        clearAll,
        getSelectedCards,
    };
}
