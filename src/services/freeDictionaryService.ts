/**
 * Free Dictionary API (freedictionaryapi.com) & Autocomplete Service.
 * Endpoint: https://freedictionaryapi.com/api/v1/entries/en/{word}
 */

export interface FreeDictSuggestion {
    word: string;
    score?: number;
}

export interface FreeDictPronunciation {
    type?: string;
    text: string;
    tags?: string[];
}

export interface FreeDictForm {
    word: string;
    tags?: string[];
}

export interface FreeDictQuote {
    text: string;
    reference?: string;
}

export interface FreeDictTranslation {
    language?: {
        code?: string;
        name?: string;
    };
    word: string;
}

export interface FreeDictSense {
    definition: string;
    tags?: string[];
    examples?: string[];
    quotes?: FreeDictQuote[];
    synonyms?: string[];
    antonyms?: string[];
    translations?: FreeDictTranslation[];
}

export interface FreeDictEntryItem {
    language?: {
        code?: string;
        name?: string;
    };
    partOfSpeech: string;
    pronunciations?: FreeDictPronunciation[];
    forms?: FreeDictForm[];
    senses: FreeDictSense[];
    synonyms?: string[];
    antonyms?: string[];
}

export interface FreeDictWordResponse {
    word: string;
    entries: FreeDictEntryItem[];
    source?: {
        url?: string;
        license?: {
            name?: string;
            url?: string;
        };
    };
}

export interface DetailedLookupResult {
    word: string;
    primaryPronunciation: string;
    pronunciationsList: FreeDictPronunciation[];
    primaryPos: string;
    vietnameseMeaning: string;
    entries: FreeDictEntryItem[];
    allSynonyms: string[];
    allAntonyms: string[];
    primaryExample?: string;
}

/**
 * 1. Autocomplete / suggestions when typing (Datamuse API)
 */
export async function getWordSuggestions(query: string, limit: number = 8): Promise<FreeDictSuggestion[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    try {
        const res = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(q)}&max=${limit}`);
        if (!res.ok) return [{ word: q }];
        const data: FreeDictSuggestion[] = await res.json();

        // Check if exact word exists
        const hasExact = data.some((item) => item.word.toLowerCase() === q);
        if (!hasExact) {
            return [{ word: q }, ...data].slice(0, limit);
        }

        // Sort exact match to top
        data.sort((a, b) => {
            if (a.word.toLowerCase() === q) return -1;
            if (b.word.toLowerCase() === q) return 1;
            return (b.score || 0) - (a.score || 0);
        });

        return data.slice(0, limit);
    } catch (error) {
        console.warn('Datamuse suggestion error:', error);
        return [{ word: q }];
    }
}

/**
 * 2. Translate text to Vietnamese using Google Translate API
 */
export async function translateTextToVietnamese(text: string): Promise<string> {
    const trimmed = text.trim();
    if (!trimmed) return '';

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(trimmed)}`;
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && Array.isArray(data[0])) {
                const translated = data[0].map((item: any) => item[0]).join('');
                if (translated) return translated;
            }
        }
    } catch (e) {
        console.warn('Translation error:', e);
    }

    return trimmed;
}

/**
 * 3. Lookup word using FreeDictionaryAPI.com
 * URL: https://freedictionaryapi.com/api/v1/entries/en/{word}
 */
export async function lookupWordFromFreeDictionaryAPI(word: string): Promise<DetailedLookupResult> {
    const trimmed = word.trim().toLowerCase();
    if (!trimmed) throw new Error('Vui lòng nhập từ cần tra cứu.');

    const url = `https://freedictionaryapi.com/api/v1/entries/en/${encodeURIComponent(trimmed)}`;

    let apiData: FreeDictWordResponse | null = null;

    try {
        const res = await fetch(url);
        if (res.ok) {
            apiData = await res.json();
        }
    } catch (err) {
        console.warn('FreeDictionaryAPI fetch error:', err);
    }

    // Translate word to Vietnamese
    const vietnameseMeaning = await translateTextToVietnamese(trimmed);

    if (apiData && Array.isArray(apiData.entries) && apiData.entries.length > 0) {
        const entries = apiData.entries;
        const firstEntry = entries[0];
        
        // Collect pronunciations
        const pronunciationsList: FreeDictPronunciation[] = [];
        const seenIpa = new Set<string>();

        entries.forEach((e) => {
            e.pronunciations?.forEach((p) => {
                if (p.text && !seenIpa.has(p.text)) {
                    seenIpa.add(p.text);
                    pronunciationsList.push(p);
                }
            });
        });

        const primaryPronunciation = pronunciationsList[0]?.text || `/${trimmed}/`;
        const primaryPos = firstEntry.partOfSpeech || 'n';

        // Collect all Synonyms & Antonyms
        const allSynonymsSet = new Set<string>();
        const allAntonymsSet = new Set<string>();

        entries.forEach((e) => {
            e.synonyms?.forEach((s) => allSynonymsSet.add(s));
            e.antonyms?.forEach((a) => allAntonymsSet.add(a));
            e.senses?.forEach((sense) => {
                sense.synonyms?.forEach((s) => allSynonymsSet.add(s));
                sense.antonyms?.forEach((a) => allAntonymsSet.add(a));
            });
        });

        // Find first example
        let primaryExample = '';
        for (const e of entries) {
            for (const s of e.senses || []) {
                if (s.examples && s.examples.length > 0) {
                    primaryExample = s.examples[0];
                    break;
                }
            }
            if (primaryExample) break;
        }

        return {
            word: apiData.word || trimmed,
            primaryPronunciation,
            pronunciationsList,
            primaryPos: formatPos(primaryPos),
            vietnameseMeaning: capitalizeFirstLetter(vietnameseMeaning),
            entries,
            allSynonyms: Array.from(allSynonymsSet).slice(0, 15),
            allAntonyms: Array.from(allAntonymsSet).slice(0, 15),
            primaryExample,
        };
    }

    // Fallback if API has no entry for this specific slang/word
    return {
        word: trimmed,
        primaryPronunciation: `/${trimmed}/`,
        pronunciationsList: [{ text: `/${trimmed}/` }],
        primaryPos: 'n.',
        vietnameseMeaning: capitalizeFirstLetter(vietnameseMeaning),
        entries: [
            {
                partOfSpeech: 'noun',
                senses: [
                    {
                        definition: `Từ vựng "${trimmed}"`,
                        examples: [`Example with ${trimmed}.`],
                    },
                ],
            },
        ],
        allSynonyms: [],
        allAntonyms: [],
        primaryExample: `Example with ${trimmed}.`,
    };
}

export function formatPos(pos: string): string {
    const p = (pos || '').toLowerCase();
    if (p.includes('noun')) return 'n.';
    if (p.includes('verb')) return 'v.';
    if (p.includes('adjective') || p.includes('adj')) return 'adj.';
    if (p.includes('adverb') || p.includes('adv')) return 'adv.';
    if (p.includes('interjection') || p.includes('int')) return 'int.';
    if (p.includes('preposition') || p.includes('prep')) return 'prep.';
    if (p.includes('pronoun') || p.includes('pron')) return 'pron.';
    if (p.includes('conjunction') || p.includes('conj')) return 'conj.';
    return p ? `${p}.` : 'n.';
}

function capitalizeFirstLetter(string: string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}
