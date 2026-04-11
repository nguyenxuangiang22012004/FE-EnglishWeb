'use client';

import { useCallback } from 'react';

export const useTextToSpeech = () => {
    const speak = useCallback((text: string, lang = 'en-US') => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            // Hủy các yêu cầu đọc đang dang dở
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.9; // Tốc độ đọc chậm lại một chút cho dễ nghe
            
            // Tìm giọng đọc tiếng Anh tự nhiên hơn nếu có
            const voices = window.speechSynthesis.getVoices();
            const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
            if (englishVoice) {
                utterance.voice = englishVoice;
            }

            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('Trình duyệt không hỗ trợ Text-to-Speech.');
        }
    }, []);

    const stop = useCallback(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }, []);

    return { speak, stop };
};
