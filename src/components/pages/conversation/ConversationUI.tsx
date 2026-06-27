'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Settings, AlertCircle, Loader2, Volume2, Square } from 'lucide-react';
import { startConversation } from '@/services/gemini';
import { speakText, startListening } from '@/utils/speech';
import { conversationService, Conversation, ConversationMessage } from '@/services/conversationService';

type VocabItem = {
    word: string;
    meaning: string;
};

export default function ConversationUI() {
    const [topic, setTopic] = useState('');
    const [isSetup, setIsSetup] = useState(true);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const [vocabulary, setVocabulary] = useState<VocabItem[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Conversation list state
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingList, setIsLoadingList] = useState(false);
    
    const chatSession = useRef<any>(null);
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
        
        fetchConversations(0);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
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
            const conv = await conversationService.createConversation(topic.trim(), storedModel, '');
            setActiveConversationId(conv.id);
            
            chatSession.current = await startConversation(storedKey, topic.trim(), storedModel);
            // Send initial prompt to kickstart
            const result = await chatSession.current.sendMessage("Hello! Let's start.");
            const responseText = result.response.text();
            
            // Extract vocabulary JSON from response
            const jsonRegex = /```json\n([\s\S]*?)\n```/;
            const match = responseText.match(jsonRegex);
            let speechText = responseText;
            let vocabJsonStr = '';
            
            if (match && match[1]) {
                try {
                    vocabJsonStr = match[1];
                    const parsed = JSON.parse(match[1]);
                    if (parsed.vocabulary) {
                        setVocabulary(parsed.vocabulary);
                    }
                    // Remove JSON block from speech text
                    speechText = responseText.replace(jsonRegex, '').trim();
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
            
            const result = await chatSession.current.sendMessage(text.trim());
            let aiText = result.response.text();
            
            const aiMsg = await conversationService.addMessage(activeConversationId, 'model', aiText);
            setMessages(prev => [...prev, aiMsg]);
            speakText(aiText);
        } catch (err: any) {
            setError('Lỗi khi gửi tin nhắn: ' + (err.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
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
                    setError('Lỗi nhận diện giọng nói: ' + err.message);
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
            setTopic(fullConv.topic);
            
            if (fullConv.vocabularyJson) {
                try {
                    const parsed = JSON.parse(fullConv.vocabularyJson);
                    if (parsed.vocabulary) setVocabulary(parsed.vocabulary);
                } catch (e) {}
            }
            
            setMessages(fullConv.messages || []);
            
            // Re-initialize chat session with history
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(storedKey);
            const model = genAI.getGenerativeModel({ model: fullConv.modelId });
            
            let history = [
                {
                    role: 'user',
                    parts: [{ text: `We are going to have a conversation in English about the topic: "${fullConv.topic}". You act as my English conversation partner.\n\nRules:\n1. Speak completely in English (except when suggesting vocabulary translations).\n2. Keep your sentences natural, conversational, and not too long (1-3 sentences per response).\n3. Always end your turn by asking me a question to keep the conversation going, or reacting to what I said.\n4. For your very FIRST response, start the conversation naturally based on the topic. Also, at the very beginning of your first response, provide a list of 5 useful vocabulary words related to the topic in this JSON format:\n\`\`\`json\n{"vocabulary": [{"word": "word", "meaning": "vietnamese meaning"}]}\n\`\`\`\nThen say your first conversational sentence.` }]
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
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6 font-body">
                <div className="w-full max-w-md bg-surface-900 border border-white/[0.04] p-8 rounded-[20px] shadow-xl">
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
                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-accent-indigo transition-colors"
                            />
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
                                <div className="space-y-3">
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
        <div className="flex h-full min-h-[calc(100vh-80px)] font-body">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col p-6 bg-surface-950">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-display font-bold text-slate-100">
                            Chủ đề: {topic}
                        </h2>
                        <p className="text-sm text-slate-400">Model: {localStorage.getItem('gemini_model_id') || 'gemini-1.5-pro'}</p>
                    </div>
                    <button 
                        onClick={() => {
                            if (window.speechSynthesis) window.speechSynthesis.cancel();
                            setActiveConversationId(null);
                            setMessages([]);
                            setIsSetup(true);
                        }}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        Trở lại / Đổi chủ đề
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 mb-6 scrollbar-thin scrollbar-thumb-white/10 pr-2">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-4 rounded-2xl ${
                                msg.role === 'user' 
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
                        className={`p-4 rounded-full transition-all flex-shrink-0 shadow-lg ${
                            isRecording 
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
