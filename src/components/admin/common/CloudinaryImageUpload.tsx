'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Loader2,
  Link2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface CloudinaryImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  folder?: string;
  className?: string;
}

export const CloudinaryImageUpload: React.FC<CloudinaryImageUploadProps> = ({
  value,
  onChange,
  label = 'Ảnh bìa / Thumbnail',
  helperText = 'Hỗ trợ định dạng JPG, PNG, WEBP, GIF (Tối đa 10MB)',
  folder = 'courses',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isManualUrlMode, setIsManualUrlMode] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Chỉ chấp nhận các file định dạng hình ảnh!');
      return;
    }

    // Validate size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Kích thước ảnh quá lớn! Vui lòng chọn ảnh < 10MB.');
      return;
    }

    if (!cloudName || !uploadPreset) {
      setErrorMessage(
        'Chưa cấu hình NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME hoặc NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET trong file .env.local.'
      );
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      if (folder) {
        formData.append('folder', folder);
      }

      const xhr = new XMLHttpRequest();
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      const uploadPromise = new Promise<{ secure_url: string }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve(res);
            } catch (err) {
              reject(new Error('Phản hồi từ Cloudinary không hợp lệ.'));
            }
          } else {
            try {
              const errorRes = JSON.parse(xhr.responseText);
              reject(
                new Error(
                  errorRes?.error?.message || `Lỗi tải ảnh lên Cloudinary (${xhr.status})`
                )
              );
            } catch {
              reject(new Error(`Lỗi tải ảnh lên Cloudinary (${xhr.status})`));
            }
          }
        };

        xhr.onerror = () => reject(new Error('Lỗi kết nối mạng khi tải ảnh lên.'));
      });

      xhr.open('POST', uploadUrl, true);
      xhr.send(formData);

      const data = await uploadPromise;
      if (data.secure_url) {
        onChange(data.secure_url);
        setSuccessMessage('Đã tải ảnh lên Cloudinary thành công!');
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      console.error('Cloudinary upload error:', err);
      setErrorMessage(err.message || 'Tải ảnh thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleApplyManualUrl = () => {
    if (manualUrlInput.trim()) {
      onChange(manualUrlInput.trim());
      setManualUrlInput('');
      setIsManualUrlMode(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <ImageIcon size={16} className="text-red-400" />
          {label}
        </label>
        <button
          type="button"
          onClick={() => {
            setIsManualUrlMode(!isManualUrlMode);
            setErrorMessage(null);
          }}
          className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
        >
          <Link2 size={13} />
          {isManualUrlMode ? 'Tải ảnh từ máy' : 'Nhập URL trực tiếp'}
        </button>
      </div>

      {/* Manual URL Input Mode */}
      {isManualUrlMode && (
        <div className="flex items-center gap-2">
          <input
            type="url"
            placeholder="https://res.cloudinary.com/... hoặc link ảnh bất kỳ"
            value={manualUrlInput || (value || '')}
            onChange={(e) => {
              setManualUrlInput(e.target.value);
              onChange(e.target.value);
            }}
            className="flex-1 bg-surface-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors placeholder-slate-600"
          />
          {manualUrlInput && (
            <button
              type="button"
              onClick={handleApplyManualUrl}
              className="px-3.5 py-2.5 text-xs font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition-all"
            >
              Áp dụng
            </button>
          )}
        </div>
      )}

      {/* Main Upload / Preview Area */}
      {!isManualUrlMode && (
        <>
          {value ? (
            /* Image Preview Card */
            <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-surface-900/90 p-3">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                  <img
                    src={value}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/600x400/1e293b/white?text=Ảnh+lỗi';
                    }}
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                      <Loader2 size={24} className="text-red-400 animate-spin" />
                      <span className="text-xs text-slate-200 font-medium">
                        Đang tải {uploadProgress}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2 w-full">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                    <CheckCircle2 size={14} />
                    <span>Ảnh đã sẵn sàng</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate max-w-full font-mono bg-black/30 px-2.5 py-1.5 rounded-lg border border-white/5">
                    {value}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <UploadCloud size={14} />
                      Đổi ảnh khác
                    </button>
                    <a
                      href={value}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center gap-1"
                    >
                      <ExternalLink size={13} />
                      Xem ảnh gốc
                    </a>
                    <button
                      type="button"
                      onClick={handleRemove}
                      disabled={isUploading}
                      className="px-3 py-1.5 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Xóa ảnh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Drag & Drop Upload Zone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-red-500 bg-red-500/10 scale-[0.99]'
                  : 'border-white/15 bg-surface-900/60 hover:border-red-500/50 hover:bg-surface-900'
              } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
            >
              <div className="flex flex-col items-center justify-center gap-2.5">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-inner">
                  {isUploading ? (
                    <Loader2 size={24} className="animate-spin text-red-400" />
                  ) : (
                    <UploadCloud size={24} />
                  )}
                </div>

                {isUploading ? (
                  <div className="space-y-1.5 w-full max-w-xs">
                    <p className="text-sm font-semibold text-white">
                      Đang tải ảnh lên Cloudinary... ({uploadProgress}%)
                    </p>
                    <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden border border-white/5">
                      <div
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-full transition-all duration-200"
                        style={{ width: `${uploadProgress || 0}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        <span className="text-red-400 font-semibold hover:underline">
                          Nhấn để tải lên
                        </span>{' '}
                        hoặc kéo thả file ảnh vào đây
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{helperText}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Status Messages */}
      {errorMessage && (
        <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <CheckCircle2 size={15} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};

export default CloudinaryImageUpload;
