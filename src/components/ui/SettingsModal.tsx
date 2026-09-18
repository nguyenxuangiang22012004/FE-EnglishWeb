'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, AlertCircle, CheckCircle, Sparkles, Key, Play, RefreshCw, ShieldCheck } from 'lucide-react';
import { aiConfigService } from '@/services/aiConfigService';
import { clearFeatureTrialExhaustedLocal } from '@/utils/deviceFingerprint';

export const AI_MODELS = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Mặc định & Khuyên dùng)' },
    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite (Tốc độ siêu nhanh)' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash-Lite' },
    { id: 'gemini-3-flash', name: 'Gemini 3 Flash' },
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
    { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
];

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
    const [isSaved, setIsSaved] = useState(false);
    const [hasServerKey, setHasServerKey] = useState(false);
    const [maskedServerKey, setMaskedServerKey] = useState<string | null>(null);

    // Testing state
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            // 1. Đọc từ local
            const storedKey = localStorage.getItem('gemini_api_key') || localStorage.getItem('geminiKey') || '';
            if (storedKey) setApiKey(storedKey);

            const storedModel = localStorage.getItem('gemini_model_id') || 'gemini-2.5-flash';
            setSelectedModel(storedModel);
            setIsSaved(false);
            setTestResult(null);

            // 2. Đồng bộ từ backend nếu đã đăng nhập
            aiConfigService.getMyAiSetting().then((res) => {
                if (res.hasApiKey && res.apiKey) {
                    setHasServerKey(true);
                    setMaskedServerKey(res.maskedApiKey);
                    if (!storedKey) {
                        setApiKey(res.apiKey);
                        localStorage.setItem('gemini_api_key', res.apiKey);
                    }
                }
                if (res.preferredModel) {
                    setSelectedModel(res.preferredModel);
                    localStorage.setItem('gemini_model_id', res.preferredModel);
                }
            }).catch(() => {});
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleTestKey = async () => {
        if (!apiKey.trim()) {
            setTestResult({ success: false, message: 'Vui lòng nhập API Key để kiểm tra.' });
            return;
        }

        setIsTesting(true);
        setTestResult(null);
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey.trim()}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'ping' }] }],
                    generationConfig: { maxOutputTokens: 5 },
                }),
            });

            if (res.ok) {
                setTestResult({ success: true, message: `Kết nối thành công với ${selectedModel}!` });
            } else {
                const err = await res.json().catch(() => ({}));
                const msg = err?.error?.message || `HTTP ${res.status}`;
                setTestResult({ success: false, message: `Lỗi Gemini API: ${msg}` });
            }
        } catch (e: any) {
            setTestResult({ success: false, message: `Lỗi kết nối: ${e.message}` });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSave = async () => {
        let finalModelId = selectedModel.trim();
        
        const matchedModel = AI_MODELS.find(m => m.name.toLowerCase() === finalModelId.toLowerCase());
        if (matchedModel) {
            finalModelId = matchedModel.id;
        } else {
            finalModelId = finalModelId
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9.-]/g, '');
        }

        const trimmedKey = apiKey.trim();

        // Lưu LocalStorage
        if (trimmedKey) {
            localStorage.setItem('gemini_api_key', trimmedKey);
            localStorage.setItem('gemini_model_id', finalModelId);
            
            // Xóa các cờ hết lượt trial vì đã có key cá nhân
            ['ai-listening', 'ai-writing', 'ai-conversation', 'ai-lookup', 'ai-import', 'ai-general'].forEach((feat) => {
                clearFeatureTrialExhaustedLocal(feat);
            });
        } else {
            localStorage.removeItem('gemini_api_key');
            localStorage.removeItem('geminiKey');
        }

        // Lưu lên Backend (Mã hóa AES trong DB)
        try {
            await aiConfigService.saveMyAiSetting(trimmedKey, finalModelId);
        } catch (e) {
            console.warn('Không thể đồng bộ API Key lên máy chủ:', e);
        }

        setSelectedModel(finalModelId);
        setIsSaved(true);
        setTimeout(() => {
            onClose();
        }, 800);
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/65 backdrop-blur-sm font-body p-4">
            <div className="w-full max-w-lg bg-surface-900 border border-white/[0.08] rounded-2xl shadow-2xl p-6 relative animate-slideUp">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-2.5 mb-2">
                    <span className="p-2 rounded-xl bg-accent-indigo/20 text-accent-indigo">
                        <Key size={20} />
                    </span>
                    <h2 className="text-xl font-bold text-slate-100">
                        Cấu hình Gemini AI & API Key
                    </h2>
                </div>

                {/* Status Badge */}
                <div className="mb-5">
                    {apiKey.trim().length > 5 ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                            <ShieldCheck size={14} />
                            Đang dùng Key cá nhân — Không giới hạn lượt gọi
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                            <Sparkles size={14} />
                            Chế độ Dùng thử (Tối đa 2 lần prompt miễn phí / mỗi tính năng)
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                Gemini API Key
                            </label>
                            {maskedServerKey && (
                                <span className="text-[11px] text-slate-400 font-mono">
                                    Đã đồng bộ: {maskedServerKey}
                                </span>
                            )}
                        </div>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Nhập API Key Google Gemini (AIzaSy...)..."
                            className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-accent-indigo transition-colors"
                        />
                        <p className="text-xs text-slate-500 mt-1.5 flex items-start gap-1">
                            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                            Key được mã hóa bảo mật AES-256 trên server và lưu cache cục bộ trên trình duyệt.
                        </p>
                    </div>

                    {/* Test Key Button & Result */}
                    <div className="pt-1">
                        <button
                            type="button"
                            onClick={handleTestKey}
                            disabled={isTesting || !apiKey.trim()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-300 text-xs font-medium border border-white/5 transition-all disabled:opacity-50"
                        >
                            <Play size={12} className={isTesting ? 'animate-spin' : ''} />
                            {isTesting ? 'Đang kiểm tra...' : 'Kiểm tra kết nối Key'}
                        </button>

                        {testResult && (
                            <div className={`mt-2 p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                                testResult.success
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                            }`}>
                                {testResult.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                <span>{testResult.message}</span>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-white/[0.06]">
                        <button
                            onClick={handleSave}
                            className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-all ${isSaved
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-accent-indigo hover:bg-accent-indigo-light text-white shadow-lg shadow-accent-indigo/25'
                                }`}
                        >
                            {isSaved ? (
                                <>
                                    <CheckCircle size={18} />
                                    Đã lưu cài đặt!
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Lưu Cấu Hình
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};