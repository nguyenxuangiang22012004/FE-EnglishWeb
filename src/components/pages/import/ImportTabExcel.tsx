'use client';

import React, { useCallback, useRef } from 'react';
import { downloadImportTemplate } from '@/services/excelImportService';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ImportTabExcelProps {
    fileName: string;
    isLoading: boolean;
    error: string | null;
    onFileSelect: (file: File) => void;
    onRemoveFile: () => void;
    onPreview: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ImportTabExcel: React.FC<ImportTabExcelProps> = ({
    fileName,
    isLoading,
    error,
    onFileSelect,
    onRemoveFile,
    onPreview,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = React.useState(false);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) onFileSelect(file);
        },
        [onFileSelect],
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
            // reset input để chọn lại cùng file
            e.target.value = '';
        },
        [onFileSelect],
    );

    const handleDownloadTemplate = useCallback(async () => {
        try {
            await downloadImportTemplate();
        } catch {
            // lỗi download hiếm gặp, bỏ qua
        }
    }, []);

    return (
        <div className="space-y-6">
            {/* Mô tả */}
            <div className="glass-card p-5 border border-accent-emerald/20 bg-gradient-to-br from-accent-emerald/5 to-transparent">
                <h3 className="font-display font-bold text-accent-emerald mb-2">
                    📊 Import từ file Excel
                </h3>
                <p className="text-sm text-slate-400">
                    Tải file mẫu về, điền từ vựng vào rồi upload lên. Hệ thống sẽ tự động đọc
                    và hiển thị danh sách để bạn chọn lọc.
                </p>
            </div>

            {/* Nút tải file mẫu */}
            <button
                id="excel-download-template-btn"
                onClick={handleDownloadTemplate}
                className="w-full py-3 flex items-center justify-center gap-2 border border-accent-emerald/30 text-accent-emerald rounded-xl font-semibold text-sm hover:bg-accent-emerald/10 transition-all"
            >
                <span>📥</span>
                <span>Tải file mẫu Excel (.xlsx)</span>
            </button>

            {/* Hướng dẫn cột */}
            <div className="glass-card p-4 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Cấu trúc file mẫu
                </p>
                <div className="grid grid-cols-5 gap-1 text-center">
                    {[
                        { label: 'Từ vựng', required: true,  color: 'text-accent-indigo-light' },
                        { label: 'Nghĩa',   required: true,  color: 'text-accent-cyan' },
                        { label: 'Phiên âm', required: false, color: 'text-slate-400' },
                        { label: 'Loại từ', required: false, color: 'text-slate-400' },
                        { label: 'Ví dụ',   required: false, color: 'text-slate-400' },
                    ].map((col) => (
                        <div
                            key={col.label}
                            className="bg-white/[0.04] rounded-lg py-2 px-1 border border-white/[0.06]"
                        >
                            <p className={`text-xs font-semibold ${col.color}`}>{col.label}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                                {col.required ? '* bắt buộc' : 'tùy chọn'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Vùng kéo thả / upload */}
            {fileName ? (
                /* File đã chọn */
                <div className="glass-card p-4 border border-accent-emerald/30 flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">{fileName}</p>
                        <p className="text-xs text-slate-500">File đã sẵn sàng</p>
                    </div>
                    <button
                        onClick={onRemoveFile}
                        className="text-slate-400 hover:text-accent-rose transition-colors text-lg flex-shrink-0"
                        aria-label="Xóa file"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                /* Drop zone */
                <div
                    id="excel-drop-zone"
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    className={`glass-card p-10 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                        isDragOver
                            ? 'border-accent-emerald bg-accent-emerald/10'
                            : 'border-white/[0.12] hover:border-accent-emerald/40 hover:bg-accent-emerald/5'
                    }`}
                >
                    <div className="text-4xl mb-3">{isDragOver ? '📂' : '📊'}</div>
                    <p className="text-slate-300 font-semibold text-sm">
                        Kéo thả file vào đây
                    </p>
                    <p className="text-slate-500 text-xs mt-1">hoặc nhấn để chọn file</p>
                    <p className="text-slate-600 text-xs mt-2">.xlsx, .xls · Tối đa 500 từ</p>
                </div>
            )}

            <input
                ref={inputRef}
                id="excel-file-input"
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileInput}
            />

            {/* Lỗi */}
            {error && (
                <div className="bg-accent-rose/10 border border-accent-rose/20 rounded-xl p-4 text-accent-rose text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Nút xem trước */}
            {isLoading ? (
                <div className="w-full py-4 bg-accent-emerald/10 border border-accent-emerald/20 rounded-xl flex items-center justify-center gap-3 text-accent-emerald font-semibold">
                    <span className="animate-spin text-lg">⚙️</span>
                    <span>Đang đọc file...</span>
                </div>
            ) : (
                <button
                    id="excel-preview-btn"
                    onClick={onPreview}
                    disabled={!fileName}
                    className="w-full py-4 bg-gradient-to-r from-accent-emerald to-accent-cyan text-white rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-accent-emerald/20"
                >
                    🔍 Xem trước danh sách từ
                </button>
            )}
        </div>
    );
};
