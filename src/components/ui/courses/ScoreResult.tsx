import React from 'react';
import { Star, RotateCcw, ArrowRight } from 'lucide-react';

interface ScoreResultProps {
  score: number;
  feedback?: string;
  onRetry?: () => void;
  onNext?: () => void;
}

export const ScoreResult: React.FC<ScoreResultProps> = ({ score, feedback, onRetry, onNext }) => {
  const isPass = score >= 80;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 max-w-md w-full mx-auto text-center">
      
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3].map((star) => (
          <Star 
            key={star} 
            size={48} 
            className={`${
              isPass && score >= star * 30 
                ? 'text-yellow-400 fill-yellow-400 animate-bounce' 
                : 'text-slate-200 fill-slate-200'
            }`} 
            style={{ animationDelay: `${star * 150}ms` }}
          />
        ))}
      </div>

      <h2 className={`text-3xl font-bold mb-2 ${isPass ? 'text-green-500' : 'text-red-500'}`}>
        {isPass ? 'Tuyệt vời!' : 'Thử lại nhé!'}
      </h2>
      
      <div className="text-6xl font-black text-slate-800 mb-4">
        {score}<span className="text-3xl text-slate-400">/100</span>
      </div>

      {feedback && (
        <div className="bg-slate-50 p-4 rounded-xl mb-8 text-left text-slate-600 border border-slate-100">
          <p className="font-medium text-slate-800 mb-1">Gợi ý từ AI:</p>
          <p>{feedback}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button 
          onClick={onRetry}
          className="flex-1 py-3 px-4 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw size={20} /> Luyện lại
        </button>
        {isPass && onNext && (
          <button 
            onClick={onNext}
            className="flex-1 py-3 px-4 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
          >
            Tiếp theo <ArrowRight size={20} />
          </button>
        )}
      </div>

    </div>
  );
};
