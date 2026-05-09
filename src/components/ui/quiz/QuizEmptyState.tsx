import React from 'react';

interface QuizEmptyStateProps { emoji: string; title: string; description: React.ReactNode; buttonText: string; onButtonClick: () => void; }

const QuizEmptyState: React.FC<QuizEmptyStateProps> = ({ emoji, title, description, buttonText, onButtonClick }) => {
    return (
        <div className="min-h-screen bg-surface-900 flex items-center justify-center px-4">
            <div className="glass-card p-10 text-center max-w-md w-full animate-fadeInScale">
                <div className="text-6xl mb-4">{emoji}</div>
                <h2 className="text-2xl font-display font-bold text-slate-200 mb-3">{title}</h2>
                <p className="text-slate-400 mb-6">{description}</p>
                <button onClick={onButtonClick} className="px-8 py-3 bg-gradient-to-r from-accent-indigo to-accent-indigo-light text-white rounded-xl font-semibold glow-btn">{buttonText}</button>
            </div>
        </div>
    );
};

export default QuizEmptyState;
