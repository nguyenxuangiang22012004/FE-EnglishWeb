import { GoogleGenerativeAI } from '@google/generative-ai';

export const getGeminiModel = (apiKey: string, modelId: string = 'gemini-1.5-pro') => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelId });
    return model;
};

export const startConversation = async (
    apiKey: string,
    topic: string,
    level: string = 'B1',
    modelId: string = 'gemini-1.5-pro',
) => {
    const model = getGeminiModel(apiKey, modelId);

    const strictSystemPrompt = buildConversationSystemPrompt(topic, level);

    const chat = model.startChat({
        history: [
            {
                role: 'user',
                parts: [{ text: strictSystemPrompt }],
            },
            {
                role: 'model',
                parts: [{
                    text: 'Understood. I will strictly follow the output format. My first response will always start with the ```json vocabulary block containing exactly 3 items, then my conversational opening sentence ending with a question. All subsequent replies will be plain English text only — no JSON, no markdown.',
                }],
            },
        ],
        generationConfig: {
            maxOutputTokens: 600,
            temperature: 0.5,
        },
    });

    return chat;
};

export const buildConversationSystemPrompt = (topic: string, level: string): string => {
    return `You are an English conversation partner helping a learner practice speaking English.
Topic: "${topic}"
Learner level: ${level}

=== STRICT OUTPUT RULES ===
You MUST follow these rules for EVERY response without exception:

RULE 1 - LANGUAGE: Reply only in English. Vietnamese is allowed only inside vocabulary JSON meanings.
RULE 2 - LENGTH: Keep each response to 1-3 sentences maximum.
RULE 3 - ENGAGEMENT: Always end your turn with a question to keep the conversation going.
RULE 4 - NO EXTRA FORMATTING: Do not use bullet points, headers, bold text, or markdown outside of what is specified below.

=== FIRST RESPONSE FORMAT (MANDATORY) ===
Your VERY FIRST response MUST follow this exact structure, in this exact order:

Step 1 — Output the vocabulary JSON block:
\`\`\`json
{"vocabulary": [{"word": "WORD1", "meaning": "VIETNAMESE1"}, {"word": "WORD2", "meaning": "VIETNAMESE2"}, {"word": "WORD3", "meaning": "VIETNAMESE3"}]}
\`\`\`

Step 2 — Output your conversational opening sentence(s) followed by a question.

=== CONCRETE EXAMPLE (topic: "At the restaurant", level: B1) ===
\`\`\`json
{"vocabulary": [{"word": "recommend", "meaning": "gợi ý / đề xuất"}, {"word": "appetizer", "meaning": "món khai vị"}, {"word": "bill", "meaning": "hóa đơn"}]}
\`\`\`
Hi! I love talking about restaurants. There are so many delicious options out there. What kind of food do you enjoy the most?

=== SUBSEQUENT RESPONSES (after the first) ===
After the first response, output PLAIN ENGLISH TEXT ONLY.
- NO JSON block.
- NO markdown code fences.
- Just your reply and a question.

=== CRITICAL WARNING ===
If your first response does NOT start with a valid \`\`\`json ... \`\`\` block containing exactly a "vocabulary" array with 3 objects (each having "word" and "meaning" keys), the output CANNOT be parsed and the app will fail. Always produce the vocabulary JSON block first in your very first response.`;
};
