import { GoogleGenerativeAI } from '@google/generative-ai';

export const getGeminiModel = (apiKey: string, modelId: string = 'gemini-1.5-pro') => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelId });
    return model;
};

export const startConversation = async (apiKey: string, topic: string, modelId: string = 'gemini-1.5-pro') => {
    const model = getGeminiModel(apiKey, modelId);
    const chat = model.startChat({
        history: [
            {
                role: 'user',
                parts: [{ text: `We are going to have a conversation in English about the topic: "${topic}". You act as my English conversation partner.
                
Rules:
1. Speak completely in English (except when suggesting vocabulary translations).
2. Keep your sentences natural, conversational, and not too long (1-3 sentences per response).
3. Always end your turn by asking me a question to keep the conversation going, or reacting to what I said.
4. For your very FIRST response, start the conversation naturally based on the topic. Also, at the very beginning of your first response, provide a list of 5 useful vocabulary words related to the topic in this JSON format:
\`\`\`json
{"vocabulary": [{"word": "word", "meaning": "vietnamese meaning"}]}
\`\`\`
Then say your first conversational sentence.` }]
            },
            {
                role: 'model',
                parts: [{ text: 'Understood. I am ready to start the conversation.' }]
            }
        ],
        generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
        },
    });

    return chat;
};
