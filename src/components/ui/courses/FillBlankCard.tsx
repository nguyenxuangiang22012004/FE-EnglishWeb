import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

interface FillBlankCardProps {
  sentence: string; // e.g., "_____ to meet you."
  answer: string; // e.g., "Nice"
  onComplete: (isCorrect: boolean) => void;
}

export const FillBlankCard: React.FC<FillBlankCardProps> = ({ sentence, answer, onComplete }) => {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const parts = sentence.split('_____');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const correct = inputValue.trim().toLowerCase() === answer.toLowerCase();
    setIsCorrect(correct);
    setIsSubmitted(true);
    
    if (correct) {
      setTimeout(() => onComplete(true), 1500);
    }
  };

  const handleRetry = () => {
    setIsSubmitted(false);
    setInputValue('');
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
      <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Điền từ còn thiếu vào chỗ trống</h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
        <div className="text-2xl font-medium text-slate-700 flex flex-wrap items-center justify-center gap-2 leading-loose">
          <span>{parts[0]}</span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isSubmitted && isCorrect}
            className={`w-32 text-center border-b-2 font-bold focus:outline-none focus:border-blue-500 bg-slate-50 rounded-t-md px-2 py-1 ${
              isSubmitted 
                ? isCorrect 
                  ? 'border-green-500 text-green-600 bg-green-50' 
                  : 'border-red-500 text-red-600 bg-red-50'
                : 'border-slate-300 text-blue-600'
            }`}
            autoFocus
          />
          <span>{parts[1]}</span>
        </div>

        {isSubmitted && (
          <div className={`flex items-center gap-2 font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
            {isCorrect ? (
              <><Check size={24} /> Chính xác!</>
            ) : (
              <><X size={24} /> Sai rồi, hãy thử lại!</>
            )}
          </div>
        )}

        <div className="flex gap-4 w-full mt-4">
          {!isCorrect && isSubmitted && (
            <button
              type="button"
              onClick={handleRetry}
              className="flex-1 py-3 px-4 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Thử lại
            </button>
          )}
          {(!isSubmitted || (!isCorrect && !isSubmitted)) && (
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="flex-1 py-3 px-4 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-md"
            >
              Kiểm tra
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
