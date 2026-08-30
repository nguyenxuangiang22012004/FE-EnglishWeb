import axios from '@/config/axios';
import { VocabularyLookupResult } from './vocabularyLookupService';

export interface AiLookupHistoryResponse extends VocabularyLookupResult {
    id: string;
    createdAt: string;
}

export const lookupHistoryService = {
    saveHistory: async (data: VocabularyLookupResult): Promise<AiLookupHistoryResponse> => {
        const response = await axios.post('/ai-lookup/history', data);
        return response.data;
    },

    getRecentHistory: async (): Promise<AiLookupHistoryResponse[]> => {
        const response = await axios.get('/ai-lookup/history/recent');
        return response.data;
    }
};

export default lookupHistoryService;
