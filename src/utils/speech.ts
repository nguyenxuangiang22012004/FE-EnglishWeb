// ─── Type Definitions ─────────────────────────────────────────────────────────

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

interface ISpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

interface ISpeechRecognitionConstructor {
    new (): ISpeechRecognition;
}

declare global {
    interface Window {
        SpeechRecognition?: ISpeechRecognitionConstructor;
        webkitSpeechRecognition?: ISpeechRecognitionConstructor;
    }
}

// ─── Text To Speech ───────────────────────────────────────────────────────────

export const speakText = (text: string, lang: string = 'en-US'): void => {
    if (!('speechSynthesis' in window)) {
        console.error('Text-to-speech not supported.');
        return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
};

// ─── Speech Recognition ───────────────────────────────────────────────────────

export const startListening = (
    onResult: (text: string) => void,
    onError: (err: string | Error) => void,
    onEnd: () => void,
    lang: string = 'en-US'
): ISpeechRecognition | null => {
    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        onError(new Error('Speech recognition not supported in this browser. Please use Chrome.'));
        return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        onError(event.error);
    };

    recognition.onend = () => {
        onEnd();
    };

    recognition.start();
    return recognition;
};