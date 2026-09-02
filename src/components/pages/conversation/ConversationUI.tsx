'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Settings, AlertCircle, Loader2, Volume2, Square } from 'lucide-react';
import { startConversation } from '@/services/gemini';
import { speakText, startListening } from '@/utils/speech';
import { useRouter } from 'next/navigation';
import { conversationService, Conversation, ConversationMessage } from '@/services/conversationService';

type VocabItem = {
    word: string;
    meaning: string;
};

export default function ConversationUI() {
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState('B1');
    const router = useRouter();
    const [isSetup, setIsSetup] = useState(true);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const [vocabulary, setVocabulary] = useState<VocabItem[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [openFeedbackId, setOpenFeedbackId] = useState<string | null>(null);

    // Conversation list state
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingList, setIsLoadingList] = useState(false);

    const chatSession = useRef<any>(null);
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const fetchConversations = async (pageNumber: number, append = false) => {
        setIsLoadingList(true);
        try {
            const data = await conversationService.getConversations(pageNumber, 5);
            if (append) {
                setConversations(prev => [...prev, ...data.content]);
            } else {
                setConversations(data.content);
            }
            setHasMore(data.number < data.totalPages - 1);
            setPage(data.number);
        } catch (err: any) {
            console.error('Error fetching conversations', err);
        } finally {
            setIsLoadingList(false);
        }
    };

    useEffect(() => {
        const storedTopic = localStorage.getItem('conversation_topic');
        if (storedTopic) setTopic(storedTopic);

        const params = new URLSearchParams(window.location.search);
        const convId = params.get('id');
        if (convId) {
            const loadFromUrl = async () => {
                const storedKey = localStorage.getItem('gemini_api_key');
                if (storedKey) {
                    try {
                        const fullConv = await conversationService.getConversation(convId);
                        handleLoadConversation(fullConv);
                    } catch (e) {
                        console.error('Failed to load conversation from URL', e);
                    }
                }
            };
            loadFromUrl();
        }

        fetchConversations(0);
    }, []);

    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    const handleStart = async () => {
        if (!topic.trim()) {
            setError('Vui lòng nhập Chủ đề.');
            return;
        }

        const storedKey = localStorage.getItem('gemini_api_key');
        const storedModel = localStorage.getItem('gemini_model_id') || 'gemini-1.5-pro';

        if (!storedKey) {
            setError('Bạn chưa nhập API Key. Vui lòng vào Cài đặt (ở menu Avatar) để thiết lập.');
            return;
        }

        localStorage.setItem('conversation_topic', topic.trim());
        setError('');
        setIsLoading(true);

        try {
            const conv = await conversationService.createConversation(topic.trim(), storedModel, level, '');
            setActiveConversationId(conv.id);
            router.push(`?id=${conv.id}`);

            chatSession.current = await startConversation(storedKey, topic.trim(), level, storedModel);
            // Send initial prompt to kickstart
            const result = await chatSession.current.sendMessage("Hello! Let's start.");
            const responseText = result.response.text();

            // Extract vocabulary JSON from response
            const jsonRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/i;
            const match = responseText.match(jsonRegex) || responseText.match(/(\{[\s\S]*"vocabulary"[\s\S]*\})/);
            let speechText = responseText;
            let vocabJsonStr = '';

            if (match && match[1]) {
                try {
                    vocabJsonStr = match[1];
                    const parsed = JSON.parse(match[1]);
                    if (parsed.vocabulary) {
                        setVocabulary(parsed.vocabulary);
                        // Save initial vocabulary to backend
                        conversationService.updateVocabulary(conv.id, match[1]).catch(console.error);
                    }
                    // Remove JSON block from speech text
                    speechText = responseText.replace(match[0], '').trim();
                } catch (e) {
                    console.error('Failed to parse vocab JSON', e);
                }
            }

            const aiMsg = await conversationService.addMessage(conv.id, 'model', speechText);
            setMessages([aiMsg]);

            // Re-fetch conversations to show the new one
            fetchConversations(0);

            speakText(speechText);
            setIsSetup(false);
        } catch (err: any) {
            setError(err.message || 'Lỗi khi kết nối Gemini API. Vui lòng kiểm tra lại Key.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (text: string) => {
        if (!text.trim() || !chatSession.current || !activeConversationId) return;

        setInputText('');
        setIsLoading(true);

        try {
            const userMsg = await conversationService.addMessage(activeConversationId, 'user', text.trim());
            setMessages(prev => [...prev, userMsg]);

            // Generate feedback for user message in background
            generateFeedbackForUserMessage(activeConversationId, userMsg.id, text.trim());

            const result = await chatSession.current.sendMessage(text.trim());
            let aiText = result.response.text();

            // Filter out JSON block if AI accidentally includes it
            const jsonRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/i;
            const match = aiText.match(jsonRegex) || aiText.match(/(\{[\s\S]*"vocabulary"[\s\S]*\})/);
            if (match) {
                aiText = aiText.replace(match[0], '').trim();
            }

            const aiMsg = await conversationService.addMessage(activeConversationId, 'model', aiText);
            setMessages(prev => [...prev, aiMsg]);
            speakText(aiText);

            // Generate vocabulary for the next turn in background
            generateVocabularyForNextTurn(activeConversationId, topic, text.trim(), aiText);

        } catch (err: any) {
            setError('Lỗi khi gửi tin nhắn: ' + (err.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    const generateFeedbackForUserMessage = async (convId: string, msgId: string, userText: string) => {
        const storedKey = localStorage.getItem('gemini_api_key');
        const storedModel = localStorage.getItem('gemini_model_id') || 'gemini-1.5-pro';
        if (!storedKey) return;

        try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(storedKey);
            const model = genAI.getGenerativeModel({ model: storedModel });

            const prompt = `Evaluate this English sentence provided by an English learner: "${userText}". 
Give a short feedback in Vietnamese (explain any grammar or vocabulary mistakes if any, or just say it's good), and provide a better or more natural way to say it in English.
Return ONLY JSON format exactly like this, no markdown formatting:
\`\`\`json
{"feedback": "nhận xét bằng tiếng Việt", "suggested_answer": "better English sentence"}
\`\`\`
`;
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const jsonRegex = /```json\n([\s\S]*?)\n```/;
            const match = responseText.match(jsonRegex) || responseText.match(/{[\s\S]*}/);

            if (match) {
                const jsonStr = match[1] || match[0];
                const parsed = JSON.parse(jsonStr);
                if (parsed.feedback || parsed.suggested_answer) {
                    await conversationService.updateMessageFeedback(convId, msgId, parsed.feedback || '', parsed.suggested_answer || '');
                    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, feedback: parsed.feedback, suggestedAnswer: parsed.suggested_answer } : m));
                }
            }
        } catch (e) {
            console.error('Failed to generate feedback for user message', e);
        }
    };

    const generateVocabularyForNextTurn = async (convId: string, convTopic: string, lastUserMsg: string, lastAiMsg: string) => {
        const storedKey = localStorage.getItem('gemini_api_key');
        const storedModel = localStorage.getItem('gemini_model_id') || 'gemini-1.5-pro';
        if (!storedKey) return;

        try {
            setVocabulary([]); // trigger loading state
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(storedKey);
            const model = genAI.getGenerativeModel({ model: storedModel });

            const prompt = `Based on the conversation history about "${convTopic}", suggest 3 useful English vocabulary words or phrases that the user could use to reply to the AI's latest message.
AI's latest message: "${lastAiMsg}"
Return ONLY JSON format exactly like this, no markdown formatting:
\`\`\`json
{"vocabulary": [{"word": "word", "meaning": "vietnamese meaning"}]}
\`\`\`
`;
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const jsonRegex = /```json\n([\s\S]*?)\n```/;
            const match = responseText.match(jsonRegex) || responseText.match(/{[\s\S]*}/);

            if (match) {
                const jsonStr = match[1] || match[0];
                const parsed = JSON.parse(jsonStr);
                if (parsed.vocabulary) {
                    setVocabulary(parsed.vocabulary);
                    conversationService.updateVocabulary(convId, jsonStr).catch(console.error);
                }
            }
        } catch (e) {
            console.error('Failed to generate vocabulary for next turn', e);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsRecording(false);
        } else {
            setError('');
            recognitionRef.current = startListening(
                (text) => {
                    setInputText(prev => prev ? prev + ' ' + text : text);
                },
                (err) => {
                    setError('Lỗi nhận diện giọng nói: ');
                    setIsRecording(false);
                },
                () => {
                    setIsRecording(false);
                }
            );
            if (recognitionRef.current) {
                setIsRecording(true);
            }
        }
    };

    const handleLoadConversation = async (conv: Conversation) => {
        const storedKey = localStorage.getItem('gemini_api_key');
        if (!storedKey) {
            setError('Bạn chưa nhập API Key. Vui lòng vào Cài đặt.');
            return;
        }

        try {
            setIsLoading(true);
            const fullConv = await conversationService.getConversation(conv.id);
            setActiveConversationId(fullConv.id);
            router.push(`?id=${fullConv.id}`);
            setTopic(fullConv.topic);

            const loadedLevel = fullConv.level || 'B1';
            setLevel(loadedLevel);

            if (fullConv.vocabularyJson) {
                try {
                    const parsed = JSON.parse(fullConv.vocabularyJson);
                    if (parsed.vocabulary) setVocabulary(parsed.vocabulary);
                } catch (e) { }
            }

            setMessages(fullConv.messages || []);

            // Re-initialize chat session with history
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(storedKey);
            const model = genAI.getGenerativeModel({ model: fullConv.modelId });

            let history = [
                {
                    role: 'user',
                    parts: [{ text: `We are going to have a conversation in English about the topic: "${fullConv.topic}". You act as my English conversation partner. My English proficiency level is ${loadedLevel}. Please adapt your vocabulary, grammar complexity, and response length to match my level.\n\nRules:\n1. Speak completely in English (except when suggesting vocabulary translations).\n2. Keep your sentences natural, conversational, and not too long (1-3 sentences per response).\n3. Always end your turn by asking me a question to keep the conversation going, or reacting to what I said.\n4. For your very FIRST response, start the conversation naturally based on the topic. Also, at the very beginning of your first response, provide a list of 3 useful vocabulary words related to the topic in this JSON format:\n\`\`\`json\n{"vocabulary": [{"word": "word", "meaning": "vietnamese meaning"}]}\n\`\`\`\nThen say your first conversational sentence.` }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'Understood. I am ready to start the conversation.' }]
                }
            ];

            // Add previous messages to history
            if (fullConv.messages) {
                history = history.concat(fullConv.messages.map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                })));
            }

            chatSession.current = model.startChat({
                history: history,
                generationConfig: {
                    maxOutputTokens: 500,
                    temperature: 0.7,
                },
            });

            setIsSetup(false);
        } catch (err: any) {
            setError('Lỗi khi tải cuộc hội thoại: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSetup) {
        return (
            <div className="flex flex-col h-full flex-1 p-6 font-body overflow-y-auto">
                <div className="w-full max-w-md bg-surface-900 border border-white/[0.04] p-8 rounded-[20px] shadow-xl m-auto">
                    <div className="flex items-center justify-center w-12 h-12 bg-accent-indigo/20 rounded-xl mb-6 mx-auto">
                        <Settings className="text-accent-indigo" size={24} />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-center text-slate-100 mb-2">
                        Thiết lập Hội Thoại AI
                    </h2>
                    <p className="text-center text-slate-400 mb-8 text-sm">
                        Luyện nói tiếng Anh theo chủ đề cùng trí tuệ nhân tạo Gemini
                    </p>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="mb-4 text-sm text-slate-400 bg-surface-800 p-3 rounded-lg border border-white/5">
                            <p>💡 Mẹo: Bạn có thể cài đặt API Key và đổi Mô hình AI trong mục <b>Cài đặt</b> ở góc dưới bên trái màn hình (Menu Avatar).</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Chủ đề bạn muốn nói
                            </label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Ví dụ: At the restaurant, Travel plans..."
                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-accent-indigo transition-colors mb-4"
                            />
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Trình độ tiếng Anh của bạn
                            </label>
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-accent-indigo transition-colors cursor-pointer appearance-none"
                            >
                                <option value="A1" className="bg-surface-900 text-slate-200">A1 - Mới bắt đầu</option>
                                <option value="A2" className="bg-surface-900 text-slate-200">A2 - Cơ bản</option>
                                <option value="B1" className="bg-surface-900 text-slate-200">B1 - Trung cấp</option>
                                <option value="B2" className="bg-surface-900 text-slate-200">B2 - Trung cấp trên</option>
                                <option value="C1" className="bg-surface-900 text-slate-200">C1 - Cao cấp</option>
                            </select>
                        </div>

                        <button
                            onClick={handleStart}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-accent-indigo hover:bg-accent-indigo-light text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Bắt đầu luyện tập'}
                        </button>

                        <div className="pt-6 border-t border-white/[0.04]">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Lịch sử hội thoại</h3>

                            {isLoadingList && conversations.length === 0 ? (
                                <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-slate-500" /></div>
                            ) : conversations.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">Chưa có cuộc hội thoại nào.</p>
                            ) : (
                                <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                    {conversations.map(conv => (
                                        <div
                                            key={conv.id}
                                            onClick={() => handleLoadConversation(conv)}
                                            className="bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] p-4 rounded-xl cursor-pointer transition-colors"
                                        >
                                            <p className="text-slate-200 font-medium">{conv.topic}</p>
                                            <p className="text-xs text-slate-500 mt-1">{new Date(conv.createdAt).toLocaleString('vi-VN')}</p>
                                        </div>
                                    ))}
                                    {hasMore && (
                                        <button
                                            onClick={() => fetchConversations(page + 1, true)}
                                            className="w-full text-xs text-accent-indigo hover:text-accent-indigo-light py-2 mt-2 transition-colors"
                                        >
                                            {isLoadingList ? 'Đang tải...' : 'Tải thêm'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full max-h-full flex-1 min-h-0 overflow-hidden font-body w-full">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col p-6 bg-surface-950 min-h-0 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-3">
                            Chủ đề: {topic}
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-accent-indigo/20 text-accent-indigo-light">Level: {level}</span>
                        </h2>
                    </div>
                    <button
                        onClick={() => {
                            if (window.speechSynthesis) window.speechSynthesis.cancel();
                            setActiveConversationId(null);
                            setMessages([]);
                            setIsSetup(true);
                            router.push('/conversation');
                        }}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        Trở lại / Đổi chủ đề
                    </button>
                </div>

                <div 
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto space-y-4 mb-6 scrollbar-thin scrollbar-thumb-white/10 pr-2"
                >
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-4 rounded-2xl ${msg.role === 'user'
                                ? 'bg-accent-indigo text-white rounded-br-sm'
                                : 'bg-white/[0.04] border border-white/[0.08] text-slate-200 rounded-bl-sm'
                                }`}>
                                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                {msg.role === 'model' && (
                                    <button
                                        onClick={() => speakText(msg.text)}
                                        className="mt-2 text-slate-400 hover:text-accent-indigo-light transition-colors"
                                        title="Nghe lại"
                                    >
                                        <Volume2 size={16} />
                                    </button>
                                )}
                                {msg.role === 'user' && msg.feedback && (
                                    <div className="mt-3 pt-3 border-t border-white/20">
                                        <button
                                            onClick={() => setOpenFeedbackId(openFeedbackId === msg.id ? null : msg.id)}
                                            className="text-xs text-white/80 hover:text-white flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            💡 {openFeedbackId === msg.id ? 'Ẩn nhận xét' : 'Xem nhận xét'}
                                        </button>
                                        {openFeedbackId === msg.id && (
                                            <div className="mt-3 text-[14px] bg-black/20 p-3 rounded-lg text-white/90 space-y-2">
                                                <p><span className="font-semibold text-yellow-300">Nhận xét:</span> {msg.feedback}</p>
                                                {msg.suggestedAnswer && (
                                                    <p><span className="font-semibold text-green-300">Mẫu tốt hơn:</span> {msg.suggestedAnswer}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white/[0.04] border border-white/[0.08] text-slate-400 p-4 rounded-2xl rounded-bl-sm flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin" />
                                <span>AI đang trả lời...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {error && (
                    <div className="mb-4 text-red-400 text-sm bg-red-500/10 p-2 rounded-lg text-center">
                        {error}
                    </div>
                )}

                <div className="relative flex items-center gap-3">
                    <button
                        onClick={toggleRecording}
                        className={`p-4 rounded-full transition-all flex-shrink-0 shadow-lg ${isRecording
                            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                            : 'bg-surface-800 hover:bg-surface-700 text-slate-300 border border-white/10'
                            }`}
                        title={isRecording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
                    >
                        {isRecording ? <Square size={20} className="fill-current" /> : <Mic size={20} />}
                    </button>

                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(inputText);
                            }
                        }}
                        placeholder="Nói hoặc gõ câu trả lời..."
                        className="flex-1 bg-surface-900 border border-white/10 rounded-2xl px-5 py-4 text-slate-200 focus:outline-none focus:border-accent-indigo transition-colors resize-none h-[56px] min-h-[56px]"
                        rows={1}
                    />

                    <button
                        onClick={() => handleSend(inputText)}
                        disabled={!inputText.trim() || isLoading}
                        className="p-4 rounded-full bg-accent-indigo hover:bg-accent-indigo-light text-white transition-all flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        <Send size={20} />
                    </button>
                </div>
                {isRecording && <p className="text-xs text-center text-red-400 mt-2">Đang nghe... hãy nói tiếng Anh</p>}
            </div>

            {/* Sidebar / Vocabulary Suggestions */}
            <div className="w-[300px] border-l border-white/[0.04] bg-surface-900 flex flex-col">
                <div className="p-6 border-b border-white/[0.04]">
                    <h3 className="font-display font-bold text-slate-100 text-lg flex items-center gap-2">
                        💡 Gợi ý từ vựng
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Dùng những từ này để trả lời</p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                    {vocabulary.length > 0 ? (
                        vocabulary.map((item, idx) => (
                            <div key={idx} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.04] transition-colors cursor-default">
                                <p className="text-accent-indigo-light font-bold text-[15px] mb-1">{item.word}</p>
                                <p className="text-sm text-slate-400">{item.meaning}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 opacity-50">
                            <Loader2 size={24} className="animate-spin mx-auto text-slate-500 mb-3" />
                            <p className="text-sm text-slate-400">Đang tìm gợi ý...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
