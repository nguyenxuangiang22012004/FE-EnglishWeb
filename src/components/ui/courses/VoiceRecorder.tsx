import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (text: string) => void;
  isProcessing?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, isProcessing = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onRecordingComplete(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-50" />
        )}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-lg ${
            isProcessing ? 'bg-slate-300' :
            isRecording ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
          }`}
        >
          {isProcessing ? (
            <Loader2 size={32} className="animate-spin" />
          ) : isRecording ? (
            <Square size={32} fill="currentColor" />
          ) : (
            <Mic size={32} />
          )}
        </button>
      </div>
      <p className={`text-sm font-medium ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
        {isProcessing ? 'Đang chấm điểm AI...' : isRecording ? 'Đang nghe...' : 'Bấm để nói'}
      </p>
    </div>
  );
};
