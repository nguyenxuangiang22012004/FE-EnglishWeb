import React from 'react';

interface MascotDialogProps {
  message: string;
  onNext?: () => void;
  showNextBtn?: boolean;
}

export const MascotDialog: React.FC<MascotDialogProps> = ({ message, onNext, showNextBtn = true }) => {
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
        
        <p className="text-lg font-medium relative z-10">{message}</p>
        
        {showNextBtn && (
          <div className="mt-4 flex justify-end relative z-10">
            <button
              onClick={onNext}
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
