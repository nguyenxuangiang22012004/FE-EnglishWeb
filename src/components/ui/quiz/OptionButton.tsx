import React from 'react';

interface OptionButtonProps {
    label: string;
    index: number;
    selectedIndex?: number;
    correctIndex: number;
    isAnswered: boolean;
    onSelect: (index: number) => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const OptionButton: React.FC<OptionButtonProps> = ({
    label,
    index,
    selectedIndex,
    correctIndex,
    isAnswered,
    onSelect,
}) => {
    const isSelected = selectedIndex === index;
    const isCorrect = correctIndex === index;
    const isWrong = isSelected && !isCorrect;

    let classes =
        'w-full p-4 text-left rounded-xl transition-all duration-200 border-2 flex items-center gap-3 font-medium ';

    if (!isAnswered) {
        classes += isSelected
            ? 'border-blue-500 bg-blue-50 text-blue-800'
            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-gray-800 cursor-pointer';
    } else {
        if (isCorrect) classes += 'border-green-500 bg-green-50 text-green-800';
        else if (isWrong) classes += 'border-red-400 bg-red-50 text-red-800';
        else classes += 'border-gray-200 bg-white text-gray-400';
    }

    const dotClass = [
        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
        !isAnswered && isSelected ? 'bg-blue-500 text-white' : '',
        !isAnswered && !isSelected ? 'bg-gray-100 text-gray-500' : '',
        isAnswered && isCorrect ? 'bg-green-500 text-white' : '',
        isAnswered && isWrong ? 'bg-red-400 text-white' : '',
        isAnswered && !isCorrect && !isWrong ? 'bg-gray-100 text-gray-400' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            onClick={() => !isAnswered && onSelect(index)}
            disabled={isAnswered}
            className={classes}
        >
            <span className={dotClass}>
                {isAnswered && isCorrect ? '✓' : isAnswered && isWrong ? '✗' : OPTION_LABELS[index]}
            </span>
            <span>{label}</span>
        </button>
    );
};

export default OptionButton;
