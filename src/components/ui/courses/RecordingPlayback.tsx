'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowRight, Mic, Play, Pause, Volume2, ListMusic } from 'lucide-react';

interface Recording {
  url: string;
  index: number;
}

interface RecordingPlaybackProps {
  audioUrl: string;
  recordings: Recording[];
  onRetry: () => void;
  onNext: () => void;
}

// ─── Helper: format seconds ───────────────────────────────────────────────────
function fmtTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ───  AudioRow ─────────────────────────────────────────────────────────────────
const AudioRow: React.FC<{
  recording: Recording;
  isLatest: boolean;
  isPlayingAll: boolean;
  playAllIndex: number | null;
  onEnded: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}> = ({ recording, isLatest, isPlayingAll, playAllIndex, onEnded, audioRef: externalRef }) => {
  const internalRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);

  // Dùng external ref nếu đây là row đang phát-tất-cả, ngược lại dùng internal
  const isCurrentPlayAll = playAllIndex === recording.index;
  const ref = isCurrentPlayAll ? externalRef : internalRef;

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  // ── rAF loop: cập nhật progress bar & time label trực tiếp qua DOM (60fps) ──
  const startRaf = useCallback(() => {
    const tick = () => {
      const audio = ref.current;
      if (!audio) return;
      const dur = audio.duration;
      const cur = audio.currentTime;

      if (fillRef.current && isFinite(dur) && dur > 0) {
        fillRef.current.style.width = `${(cur / dur) * 100}%`;
      }
      if (timeRef.current) {
        timeRef.current.textContent = `${fmtTime(cur)} / ${fmtTime(dur)}`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [ref]);

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;

    const onPlay = () => { setIsPlaying(true); startRaf(); };
    const onPause = () => { setIsPlaying(false); stopRaf(); };
    const onEnded_ = () => { setIsPlaying(false); stopRaf(); onEnded(); };
    const onDurationReady = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
        // Cập nhật label ngay khi có duration
        if (timeRef.current) {
          timeRef.current.textContent = `${fmtTime(audio.currentTime)} / ${fmtTime(audio.duration)}`;
        }
      }
    };

    // Nếu metadata đã sẵn sàng trước khi listener được gắn
    if (audio.readyState >= 1 && isFinite(audio.duration) && audio.duration > 0) {
      setDuration(audio.duration);
      if (timeRef.current) {
        timeRef.current.textContent = `0:00 / ${fmtTime(audio.duration)}`;
      }
    }

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded_);
    audio.addEventListener('loadedmetadata', onDurationReady);
    audio.addEventListener('durationchange', onDurationReady);

    // Kích hoạt load để lấy metadata với Blob/Object URL
    if (audio.readyState === 0) audio.load();

    return () => {
      stopRaf();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded_);
      audio.removeEventListener('loadedmetadata', onDurationReady);
      audio.removeEventListener('durationchange', onDurationReady);
    };
  }, [ref, onEnded, startRaf, stopRaf]);

  // Tự động phát khi được Play All chọn
  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    if (isCurrentPlayAll && isPlayingAll) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }, [isCurrentPlayAll, isPlayingAll, ref]);

  const togglePlay = () => {
    const audio = ref.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = ref.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
    // Cập nhật fill ngay lập tức sau khi seek
    if (fillRef.current) {
      fillRef.current.style.width = `${pct * 100}%`;
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        isLatest
          ? 'border-blue-500/40 bg-blue-500/10'
          : 'border-white/10 bg-white/5'
      } ${isCurrentPlayAll && isPlayingAll ? 'ring-1 ring-blue-400/50' : ''}`}
    >
      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-white transition-all shadow-md active:scale-90 ${
          isLatest ? 'bg-blue-500 hover:bg-blue-600' : 'bg-slate-600 hover:bg-slate-500'
        }`}
        aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
      >
        {isPlaying
          ? <Pause size={15} />
          : <Play size={15} className="ml-0.5" />
        }
      </button>

      <div className="flex-1 min-w-0">
        {/* Label */}
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            Lần {recording.index}
            {isLatest && (
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                Mới nhất
              </span>
            )}
            {isCurrentPlayAll && isPlayingAll && (
              <span className="text-[10px] font-bold text-emerald-400 animate-pulse">
                ▶ Đang phát
              </span>
            )}
          </p>
          {/* Time label: cập nhật trực tiếp qua DOM ref, không re-render */}
          <span ref={timeRef} className="text-[11px] text-slate-500 tabular-nums">
            0:00 / 0:00
          </span>
        </div>

        {/* Seek bar */}
        <div
          ref={trackRef}
          onClick={handleSeek}
          className="relative h-2 rounded-full cursor-pointer overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          {/* Fill: cập nhật width trực tiếp qua DOM ref — không cần CSS transition */}
          <div
            ref={fillRef}
            className={`absolute inset-y-0 left-0 rounded-full ${
              isLatest ? 'bg-blue-400' : 'bg-slate-500'
            }`}
            style={{ width: '0%' }}
          />
        </div>
      </div>

      <audio ref={ref} src={recording.url} preload="metadata" className="hidden" />
    </div>
  );
};

// ─── RecordingPlayback ────────────────────────────────────────────────────────
export const RecordingPlayback: React.FC<RecordingPlaybackProps> = ({
  audioUrl,
  recordings,
  onRetry,
  onNext,
}) => {
  // Play All state
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [playAllIndex, setPlayAllIndex] = useState<number | null>(null);

  // Refs cho từng audio (indexed by recording.index)
  const audioRefs = useRef<Map<number, React.RefObject<HTMLAudioElement>>>(new Map());

  // Đảm bảo mỗi recording có 1 ref
  recordings.forEach((rec) => {
    if (!audioRefs.current.has(rec.index)) {
      audioRefs.current.set(rec.index, React.createRef<HTMLAudioElement>());
    }
  });

  const handlePlayAll = () => {
    if (recordings.length === 0) return;
    setIsPlayingAll(true);
    setPlayAllIndex(recordings[0].index);
  };

  const handleStopAll = () => {
    setIsPlayingAll(false);
    setPlayAllIndex(null);
    // Dừng tất cả
    audioRefs.current.forEach((ref) => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });
  };

  const handleRowEnded = useCallback(() => {
    if (!isPlayingAll) return;
    setPlayAllIndex((prev) => {
      if (prev === null) return null;
      const currentIdx = recordings.findIndex((r) => r.index === prev);
      const nextRec = recordings[currentIdx + 1];
      if (nextRec) {
        return nextRec.index;
      }
      // Phát xong tất cả
      setIsPlayingAll(false);
      return null;
    });
  }, [isPlayingAll, recordings]);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
          <Volume2 size={22} className="text-blue-400" />
        </div>
        <h3 className="text-base font-bold text-slate-100">🎙️ Đây là giọng nói của bạn!</h3>
        <p className="text-xs text-slate-400">
          Nhấn ▶ để nghe từng lần, hoặc "Phát tất cả" để nghe liên tiếp.
        </p>
      </div>

      {/* Play All button */}
      {recordings.length > 1 && (
        <button
          onClick={isPlayingAll ? handleStopAll : handlePlayAll}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all ${
            isPlayingAll
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]'
          }`}
        >
          <ListMusic size={16} />
          {isPlayingAll ? '⏹ Dừng phát tất cả' : `▶ Phát tất cả (${recordings.length} lần)`}
        </button>
      )}

      {/* Danh sách */}
      <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-0.5">
        {recordings.map((rec) => (
          <AudioRow
            key={rec.url}
            recording={rec}
            isLatest={rec.index === recordings[recordings.length - 1].index}
            isPlayingAll={isPlayingAll}
            playAllIndex={playAllIndex}
            onEnded={handleRowEnded}
            audioRef={audioRefs.current.get(rec.index)!}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onRetry}
          className="flex-1 py-3 px-4 rounded-xl font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 border border-white/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Mic size={17} />
          Ghi thêm
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 px-4 rounded-xl font-semibold bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-95"
        >
          Tiếp theo
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
};

export default RecordingPlayback;
