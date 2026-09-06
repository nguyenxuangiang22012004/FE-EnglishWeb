'use client';

import React from 'react';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ImportTabAITopicProps {
    topic: string;
    wordCount: number;
    wordCountRaw: string;
    wordCountError: string | null;
    isLoading: boolean;
    error: string | null;
    onTopicChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onWordCountChange: (raw: string) => void;
    onGenerate: () => void;
    onCancel: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ImportTabAITopic: React.FC<ImportTabAITopicProps> = ({
    topic,
    wordCount,
    wordCountRaw,
    wordCountError,
    isLoading,
    error,
    onTopicChange,
    onWordCountChange,
    onGenerate,
    onCancel,
}) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) onGenerate();
    };

    return (
        <div className="space-y-6">
            {/* Description */}
            <div className="glass-card p-5 border border-accent-indigo/20 bg-gradient-to-br from-accent-indigo/5 to-transparent">
                <h3 className="font-display font-bold text-accent-indigo-light mb-2">
                    ✨ AI tạo từ vựng theo chủ đề
                </h3>
                <p className="text-sm text-slate-400">
                    Nhập bất kỳ chủ đề nào — AI sẽ tự động tạo danh sách từ vựng
                    cùng nghĩa, phiên âm và câu ví dụ.
                </p>
            </div>

            {/* Topic input */}
            <div className="space-y-2">
                <label
                    htmlFor="ai-topic-input"
                    className="block text-sm font-bold text-slate-300"
                >
                    🎯 Chủ đề từ vựng
                </label>
                <input
                    id="ai-topic-input"
                    type="text"
                    value={topic}
                    onChange={onTopicChange}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder="VD: Food & Cooking, Technology, Travel, Business..."
                    className="w-full px-4 py-3 glass-input text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>

            {/* Word count input */}
            <div className="space-y-1">
                <label
                    htmlFor="ai-topic-word-count"
                    className="block text-sm font-bold text-slate-300"
                >
                    📊 Số từ vựng mong muốn
                </label>
                <input
                    id="ai-topic-word-count"
                    type="number"
                    min={5}
                    max={200}
                    value={wordCountRaw}
                    onChange={(e) => onWordCountChange(e.target.value)}
                    disabled={isLoading}
                    placeholder="VD: 10"
                    className={`w-32 px-4 py-3 glass-input text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                        wordCountError
                            ? 'border-accent-rose/50 ring-1 ring-accent-rose/30'
                            : ''
                    }`}
                />
                {wordCountError ? (
                    <p className="text-xs text-accent-rose mt-1">⚠️ {wordCountError}</p>
                ) : (
                    <p className="text-xs text-slate-500">Tối thiểu 5 · Tối đa 200</p>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="bg-accent-rose/10 border border-accent-rose/20 rounded-xl p-4 text-accent-rose text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Generate button */}
            {isLoading ? (
                <div className="space-y-3">
                    <div className="w-full py-4 bg-accent-indigo/10 border border-accent-indigo/20 rounded-xl flex items-center justify-center gap-3 text-accent-indigo-light font-semibold">
                        <span className="animate-spin text-lg">⚙️</span>
                        <span>AI đang tạo từ vựng...</span>
                    </div>
                    <button
                        onClick={onCancel}
                        className="w-full py-2.5 text-sm text-slate-400 hover:text-slate-300 transition-colors"
                    >
                        ✕ Huỷ
                    </button>
                </div>
            ) : (
                <button
                    id="ai-topic-generate-btn"
                    onClick={onGenerate}
                    disabled={!topic.trim()}
                    className="w-full py-4 bg-gradient-to-r from-accent-indigo to-accent-cyan text-white rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-accent-indigo/20"
                >
                    ✨ Tạo {wordCount} từ vựng
                </button>
            )}
        </div>
    );
};
