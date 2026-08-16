'use client';

import { useState, useCallback } from 'react';

export interface ParsedWord {
    id: string;
    word: string;
    meaning: string;
    selected: boolean;
}

export interface ImportVocabularyState {
    rawText: string;
    parsedWords: ParsedWord[];
    jsonData: string;
    selectedCount: number;
}

const INITIAL_STATE: ImportVocabularyState = {
    rawText: '',
    parsedWords: [],
    jsonData: '',
    selectedCount: 0,
};

const buildJsonData = (words: ParsedWord[]): string => {
    const selected = words.filter((w) => w.selected);
    return JSON.stringify(
        selected.map((p) => ({
            word: p.word,
            meaning: p.meaning,
            pronunciation: '',
            example: '',
        })),
        null,
        2,
    );
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

            const jsonData = buildJsonData(parsed);

            setState({
                rawText: text,
                parsedWords: parsed,
                jsonData,
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
            const jsonData = buildJsonData(updated);
            return { ...prev, parsedWords: updated, jsonData, selectedCount: count };
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
            const jsonData = buildJsonData(updated);
            return { ...prev, parsedWords: updated, jsonData, selectedCount: count };
        });
    }, []);

    const copyJson = useCallback(() => {
        navigator.clipboard.writeText(state.jsonData);
        alert('✅ JSON copied to clipboard!');
    }, [state.jsonData]);

    const clearAll = useCallback(() => {
        setState(INITIAL_STATE);
    }, []);

    const getSelectedCards = useCallback(() => {
        return state.parsedWords
            .filter((w) => w.selected)
            .map((w) => ({
                word: w.word,
                meaning: w.meaning,
                pronunciation: '',
                example: '',
            }));
    }, [state.parsedWords]);

    const allSelected =
        state.parsedWords.length > 0 &&
        state.parsedWords.every((w) => w.selected);

    return {
        state,
        allSelected,
        handleTextChange,
        toggleWordSelection,
        toggleSelectAll,
        copyJson,
        clearAll,
        getSelectedCards,
    };
}
