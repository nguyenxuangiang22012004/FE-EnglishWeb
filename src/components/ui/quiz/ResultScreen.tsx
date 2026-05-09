import React from 'react';
import { X } from 'lucide-react';

interface ResultScreenProps { score: number; total: number; wrongCardIds: string[]; setName: string; setEmoji: string; isRetryRound: boolean; onRetryAll: () => void; onRetryWrong: () => void; onBack: () => void; }

const ResultScreen: React.FC<ResultScreenProps> = ({ score, total, wrongCardIds, setName, setEmoji, isRetryRound, onRetryAll, onRetryWrong, onBack }) => {
    const percent = Math.round((score / total) * 100);
    const wrongCount = wrongCardIds.length;

    const grade = percent >= 90
        ? { emoji: '🏆', label: 'Xuất sắc!', color: 'text-accent-amber', bgColor: 'bg-accent-amber/10', borderColor: 'border-accent-amber/30' }
        : percent >= 70
            ? { emoji: '🎉', label: 'Tốt lắm!', color: 'text-accent-emerald', bgColor: 'bg-accent-emerald/10', borderColor: 'border-accent-emerald/30' }
            : percent >= 50
                ? { emoji: '💪', label: 'Cố lên!', color: 'text-accent-indigo-light', bgColor: 'bg-accent-indigo/10', borderColor: 'border-accent-indigo/30' }
                : { emoji: '📚', label: 'Cần ôn thêm', color: 'text-accent-amber', bgColor: 'bg-accent-amber/10', borderColor: 'border-accent-amber/30' };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="glass-card max-w-md w-full p-8 text-center space-y-6 relative animate-fadeInScale border border-white/[0.08]">
                <button onClick={onBack} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] rounded-full transition" title="Quay lại"><X size={20} /></button>
                <div className="text-5xl">{grade.emoji}</div>
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-100 mb-1">{grade.label}</h1>
                    <p className="text-slate-400 flex items-center justify-center gap-2">
                        {setEmoji} {setName}
                        {isRetryRound && <span className="text-xs font-semibold px-2 py-0.5 bg-accent-amber/10 text-accent-amber rounded-full">Luyện lại câu sai</span>}
                    </p>
                </div>
                <div className="flex justify-center">
                    <div className={`w-32 h-32 rounded-full border-2 ${grade.borderColor} ${grade.bgColor} flex flex-col items-center justify-center`}>
                        <span className={`text-4xl font-display font-bold ${grade.color}`}>{percent}%</span>
                        <span className={`text-sm font-medium ${grade.color} opacity-80`}>{score}/{total}</span>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-accent-emerald/10 rounded-xl p-3 border border-accent-emerald/15">
                        <p className="text-2xl font-display font-bold text-accent-emerald">{score}</p>
                        <p className="text-xs text-accent-emerald/80">Đúng</p>
                    </div>
                    <div className="bg-accent-rose/10 rounded-xl p-3 border border-accent-rose/15">
                        <p className="text-2xl font-display font-bold text-accent-rose">{wrongCount}</p>
                        <p className="text-xs text-accent-rose/80">Sai</p>
                    </div>
                    <div className="bg-accent-indigo/10 rounded-xl p-3 border border-accent-indigo/15">
                        <p className="text-2xl font-display font-bold text-accent-indigo-light">{total}</p>
                        <p className="text-xs text-accent-indigo-light/80">Tổng</p>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <button onClick={onRetryAll} className="w-full py-3 bg-gradient-to-r from-accent-indigo to-accent-indigo-light text-white rounded-xl font-semibold glow-btn">🔄 Làm lại toàn bộ</button>
                    {wrongCount === 0 ? (
                        <div className="w-full py-3 border border-accent-emerald/20 text-accent-emerald rounded-xl text-sm text-center bg-accent-emerald/5 font-medium">🎊 Không có câu sai nào!</div>
                    ) : (
                        <button onClick={onRetryWrong} className="w-full py-3 bg-gradient-to-r from-accent-amber to-orange-500 text-white rounded-xl font-semibold glow-btn">❌ Làm lại {wrongCount} câu sai</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultScreen;
