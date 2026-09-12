'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { startListening } from '@/utils/speech';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, audioUrl: string, transcript?: string) => void;
  isProcessing?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  isProcessing = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [permissionError, setPermissionError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  const startRecording = useCallback(async () => {
    setPermissionError('');
    transcriptRef.current = '';
    try {
      // Yêu cầu mic với chất lượng cao
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
        },
      });
      streamRef.current = stream;

      // ── Web Audio API: boost gain để tăng âm lượng ──────────────────
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);

      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 2.5; // tăng âm lượng ×2.5

      const dest = audioCtx.createMediaStreamDestination();
      source.connect(gainNode);
      gainNode.connect(dest);
      // ────────────────────────────────────────────────────────────────

      chunksRef.current = [];

      // Dùng boosted stream để ghi thay vì raw stream
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(dest.stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const finalTranscript = transcriptRef.current.trim();
        onRecordingComplete(blob, url, finalTranscript);

        // Dọn dẹp: tắt mic + đóng AudioContext
        stream.getTracks().forEach((t) => t.stop());
        audioCtx.close();
        streamRef.current = null;
        audioContextRef.current = null;
      };

      // Đồng thời chạy Web Speech Recognition để bắt text người nói
      try {
        recognitionRef.current = startListening(
          (text: string) => {
            transcriptRef.current = text;
          },
          (err: any) => {
            console.warn('Speech recognition warn:', err);
          },
          () => {
            // onEnd
          },
          'en-US'
        );
      } catch (speechErr) {
        console.warn('Could not start speech recognition:', speechErr);
      }

      // Thu từng chunk mỗi 100ms để dữ liệu đầy đủ
      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setPermissionError('Bạn cần cho phép quyền microphone để ghi âm.');
      } else {
        setPermissionError('Không thể truy cập microphone. Hãy thử lại.');
      }
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsRecording(false);
    }
  }, [isRecording]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {isRecording && (
          <>
            <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-40" />
            <div className="absolute inset-0 scale-125 bg-red-400 rounded-full animate-ping opacity-20" />
          </>
        )}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-lg ${
            isProcessing
              ? 'bg-slate-300 cursor-not-allowed'
              : isRecording
              ? 'bg-red-500 hover:bg-red-600 scale-110'
              : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
          }`}
          aria-label={isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
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
        {isProcessing
          ? 'Đang xử lý...'
          : isRecording
          ? '🔴 Đang ghi âm... Nhấn để dừng'
          : 'Bấm để nói'}
      </p>

      {permissionError && (
        <p className="text-xs text-red-500 text-center max-w-[220px]">
          ⚠️ {permissionError}
        </p>
      )}
    </div>
  );
};

export default VoiceRecorder;
