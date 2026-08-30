import React, { useState, useEffect } from 'react';

interface MascotDialogProps {
  message: string;
  onNext?: () => void;
  showNextBtn?: boolean;
}

export const MascotDialog: React.FC<MascotDialogProps> = ({ message, onNext, showNextBtn = true }) => {
  const [highlightStartIndex, setHighlightStartIndex] = useState<number>(-1);
  const [highlightEndIndex, setHighlightEndIndex] = useState<number>(-1);

  useEffect(() => {
    // Ngừng phát âm thanh đang chạy nếu có
    window.speechSynthesis.cancel();
    let isMounted = true;
    
    const initSpeak = () => {
      let voices = window.speechSynthesis.getVoices();
      
      const doSpeak = (availableVoices: SpeechSynthesisVoice[]) => {
        if (!isMounted) return;
        
        const utterance = new SpeechSynthesisUtterance(message);
        
        // Tìm các giọng liên quan đến tiếng Việt
        const vnVoices = availableVoices.filter(v => 
          v.lang.toLowerCase().includes('vi') || 
          v.name.toLowerCase().includes('viet')
        );
        
        // Cố gắng tìm giọng nữ (Google, HoaiMy, Linh, Mai, v.v...)
        const femaleVoice = vnVoices.find(v => {
          const name = v.name.toLowerCase();
          return name.includes('google') || 
                 name.includes('hoaimy') || 
                 name.includes('linh') || 
                 name.includes('mai') ||
                 name.includes('female');
        });

        if (femaleVoice) {
          utterance.voice = femaleVoice;
        } else if (vnVoices.length > 0) {
          // Fallback lấy giọng tiếng Việt bất kỳ (như Microsoft An)
          utterance.voice = vnVoices[vnVoices.length - 1]; 
        }

        // Báo cho API biết ngôn ngữ
        utterance.lang = 'vi-VN';

        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            setHighlightStartIndex(event.charIndex);
            setHighlightEndIndex(event.charIndex + (event.charLength || 1));
          }
        };

        utterance.onend = () => {
          setHighlightStartIndex(-1);
          setHighlightEndIndex(-1);
        };

        window.speechSynthesis.speak(utterance);
      };

      if (voices.length > 0) {
        doSpeak(voices);
      } else {
        const onVoicesChanged = () => {
          voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            doSpeak(voices);
            window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
          }
        };
        window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      }
    };

    initSpeak();

    // Cleanup khi component unmount
    return () => {
      isMounted = false;
      window.speechSynthesis.cancel();
    };
  }, [message]);

  const renderMessage = () => {
    if (highlightStartIndex === -1 || highlightEndIndex === -1) {
      return message;
    }

    const before = message.slice(0, highlightStartIndex);
    const highlighted = message.slice(highlightStartIndex, highlightEndIndex);
    const after = message.slice(highlightEndIndex);

    return (
      <>
        {before}
        <span className="text-blue-600 rounded-sm font-bold px-0.5 transition-colors">{highlighted}</span>
        {after}
      </>
    );
  };

  return (
    <div className="flex items-end gap-4 p-4 max-w-2xl mx-auto">
      <img
        src="/mascot.jpg"
        alt="Mascot"
        className="w-32 h-32 rounded-full border-4 border-blue-200 shadow-lg object-cover"
      />
      <div className="relative bg-white text-slate-800 p-6 rounded-3xl rounded-bl-none shadow-xl border border-slate-100 flex-1">
        {/* Tail of the speech bubble */}
        <div className="absolute -left-4 bottom-0 w-8 h-8 bg-white border-l border-b border-slate-100 transform rotate-45 translate-x-2 -translate-y-2 rounded-sm" />

        <p className="text-lg font-medium relative z-10 leading-relaxed">{renderMessage()}</p>

        {showNextBtn && (
          <div className="mt-4 flex justify-end relative z-10">
            <button
              onClick={() => {
                window.speechSynthesis.cancel();
                onNext?.();
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Tiếp tục
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
