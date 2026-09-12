import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';

interface VocabularyCardProps {
  word: string;
  meaning: string;
  pronunciation: string;
  imageUrl?: string;
  example?: string;
  onPlayAudio?: () => void;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({
  word,
  meaning,
  pronunciation,
  imageUrl,
  example,
  onPlayAudio,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayAudio) {
      onPlayAudio();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div 
      className="w-full max-w-md h-80 mx-auto cursor-pointer group perspective-[1000px]"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        
        {/* Front */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-white rounded-3xl shadow-xl border-2 border-slate-100 p-6 flex flex-col items-center justify-center gap-4 hover:border-blue-300 transition-colors">
          {imageUrl && <img src={imageUrl} alt={word} className="w-32 h-32 object-cover rounded-2xl shadow-sm" />}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-slate-800 mb-2">{word}</h2>
            <p className="text-xl text-slate-500">{pronunciation}</p>
          </div>
          <button 
            onClick={playAudio}
            className="absolute top-4 right-4 p-3 rounded-full bg-slate-50 text-blue-500 hover:bg-blue-50 hover:scale-110 transition-all"
          >
            <Volume2 size={24} />
          </button>
          <p className="absolute bottom-4 text-sm text-slate-400">Chạm để lật</p>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-blue-50 rounded-3xl shadow-xl border-2 border-blue-200 p-6 flex flex-col items-center justify-center gap-4">
          <h2 className="text-3xl font-bold text-blue-700">{meaning}</h2>
          {example && (
            <div className="text-center mt-4 p-4 bg-white/60 rounded-xl">
              <p className="text-slate-700 italic">"{example}"</p>
            </div>
          )}
          <p className="absolute bottom-4 text-sm text-blue-400">Chạm để lật</p>
        </div>

      </div>
    </div>
  );
};
