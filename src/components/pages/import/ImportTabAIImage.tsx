'use client';

import React, { useCallback, useRef } from 'react';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ImportTabAIImageProps {
    imagePreview: string;
    wordCount: number;
    wordCountRaw: string;
    wordCountError: string | null;
    isLoading: boolean;
    error: string | null;
    onImageSelect: (file: File) => void;
    onRemoveImage: () => void;
    onWordCountChange: (raw: string) => void;
    onGenerate: () => void;
    onCancel: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ImportTabAIImage: React.FC<ImportTabAIImageProps> = ({
    imagePreview,
    wordCount,
    wordCountRaw,
    wordCountError,
    isLoading,
    error,
    onImageSelect,
    onRemoveImage,
    onWordCountChange,
    onGenerate,
    onCancel,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropRef = useRef<HTMLDivElement>(null);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) onImageSelect(file);
        },
        [onImageSelect],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file && file.type.startsWith('image/')) onImageSelect(file);
        },
        [onImageSelect],
    );

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <div className="space-y-6">
            {/* Description */}
            <div className="glass-card p-5 border border-accent-cyan/20 bg-gradient-to-br from-accent-cyan/5 to-transparent">
                <h3 className="font-display font-bold text-accent-cyan mb-2">
                    🖼️ AI phân tích hình ảnh
                </h3>
                <p className="text-sm text-slate-400">
                    Tải ảnh sách, tài liệu, flashcard hoặc bất kỳ hình nào — AI
                    sẽ đọc và tạo từ vựng phù hợp.
                </p>
            </div>

            {/* Image upload area */}
            {imagePreview ? (
                <div className="relative group">
                    <img
                        src={imagePreview}
                        alt="Ảnh đã chọn"
                        className="w-full max-h-64 object-contain rounded-xl border border-white/[0.08] bg-surface-800"
                    />
                    <button
                        onClick={onRemoveImage}
                        disabled={isLoading}
                        className="absolute top-3 right-3 w-8 h-8 bg-accent-rose/20 hover:bg-accent-rose/40 border border-accent-rose/30 text-accent-rose rounded-full flex items-center justify-center text-sm transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                        aria-label="Xoá ảnh"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <div
                    ref={dropRef}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/[0.12] hover:border-accent-cyan/40 rounded-xl p-10 text-center cursor-pointer transition-all hover:bg-accent-cyan/5 group"
                >
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                        🖼️
                    </div>
                    <p className="text-slate-300 font-medium">
                        Kéo thả ảnh vào đây
                    </p>
                    <p className="text-slate-500 text-sm mt-1">
                        hoặc click để chọn file
                    </p>
                    <p className="text-slate-600 text-xs mt-3">
                        JPG, PNG, WEBP, GIF · Tối đa 20MB
                    </p>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Word count input */}
            <div className="space-y-1">
                <label
                    htmlFor="ai-image-word-count"
                    className="block text-sm font-bold text-slate-300"
                >
                    📊 Số từ vựng mong muốn
                </label>
                <input
                    id="ai-image-word-count"
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
                    <div className="w-full py-4 bg-accent-cyan/10 border border-accent-cyan/20 rounded-xl flex items-center justify-center gap-3 text-accent-cyan font-semibold">
                        <span className="animate-spin text-lg">🔍</span>
                        <span>AI đang phân tích ảnh...</span>
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
                    id="ai-image-generate-btn"
                    onClick={onGenerate}
                    disabled={!imagePreview}
                    className="w-full py-4 bg-gradient-to-r from-accent-cyan to-accent-emerald text-white rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-accent-cyan/20"
                >
                    🔍 Phân tích ảnh · {wordCount} từ
                </button>
            )}
        </div>
    );
};
