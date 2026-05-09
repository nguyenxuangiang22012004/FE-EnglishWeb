import React from 'react';

interface OptionButtonProps { label: string; index: number; selectedIndex?: number; correctIndex: number; isAnswered: boolean; onSelect: (index: number) => void; }
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const OptionButton: React.FC<OptionButtonProps> = ({ label, index, selectedIndex, correctIndex, isAnswered, onSelect }) => {
    const isSelected = selectedIndex === index;
    const isCorrect = correctIndex === index;
    const isWrong = isSelected && !isCorrect;

    let classes = 'w-full p-4 text-left rounded-xl transition-all duration-200 border flex items-center gap-3 font-medium ';
    if (!isAnswered) {
        classes += isSelected
            ? 'border-accent-indigo bg-accent-indigo/10 text-accent-indigo-light'
            : 'border-white/[0.08] bg-white/[0.03] hover:border-accent-indigo/30 hover:bg-white/[0.06] text-slate-300 cursor-pointer';
    } else {
        if (isCorrect) classes += 'border-accent-emerald bg-accent-emerald/10 text-accent-emerald';
        else if (isWrong) classes += 'border-accent-rose bg-accent-rose/10 text-accent-rose';
        else classes += 'border-white/[0.04] bg-white/[0.02] text-slate-600';
    }

    const dotClass = [
        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
        !isAnswered && isSelected ? 'bg-accent-indigo text-white' : '',
        !isAnswered && !isSelected ? 'bg-white/[0.06] text-slate-500' : '',
        isAnswered && isCorrect ? 'bg-accent-emerald text-white' : '',
        isAnswered && isWrong ? 'bg-accent-rose text-white' : '',
        isAnswered && !isCorrect && !isWrong ? 'bg-white/[0.04] text-slate-600' : '',
    ].filter(Boolean).join(' ');

    return (
        <button onClick={() => !isAnswered && onSelect(index)} disabled={isAnswered} className={classes}>
            <span className={dotClass}>{isAnswered && isCorrect ? '✓' : isAnswered && isWrong ? '✗' : OPTION_LABELS[index]}</span>
            <span>{label}</span>
        </button>
    );
};

export default OptionButton;
