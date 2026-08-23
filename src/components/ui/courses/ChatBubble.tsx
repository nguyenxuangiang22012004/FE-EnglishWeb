import React from 'react';

interface ChatBubbleProps {
  message: string;
  isAI?: boolean;
  avatarUrl?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isAI = false, avatarUrl }) => {
  return (
    <div className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex max-w-[80%] items-end gap-2 ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {isAI && (
          <img 
            src={avatarUrl || "/mascot.jpg"} 
            alt="AI Avatar" 
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
          />
        )}
        
        <div 
          className={`p-4 rounded-2xl ${
            isAI 
              ? 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm' 
              : 'bg-blue-500 text-white rounded-br-none shadow-md'
          }`}
        >
          <p className="whitespace-pre-wrap">{message}</p>
        </div>

      </div>
    </div>
  );
};
