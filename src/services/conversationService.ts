import api from '@/config/axios';

export interface ConversationMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    createdAt: string;
}

export interface Conversation {
    id: string;
    topic: string;
    modelId: string;
    vocabularyJson: string;
    createdAt: string;
    messages?: ConversationMessage[];
}

export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export const conversationService = {
    getConversations: async (page: number = 0, size: number = 5): Promise<PaginatedResponse<Conversation>> => {
        const response = await api.get('/conversations', { params: { page, size } });
        return response.data;
    },

    getConversation: async (id: string): Promise<Conversation> => {
        const response = await api.get(`/conversations/${id}`);
        return response.data;
    },

    createConversation: async (topic: string, modelId: string, vocabularyJson: string): Promise<Conversation> => {
        const response = await api.post('/conversations', { topic, modelId, vocabularyJson });
        return response.data;
    },

    addMessage: async (conversationId: string, role: 'user' | 'model', text: string): Promise<ConversationMessage> => {
        const response = await api.post(`/conversations/${conversationId}/messages`, { role, text });
        return response.data;
    }
};
