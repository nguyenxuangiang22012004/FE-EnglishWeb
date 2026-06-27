import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, AlertCircle } from 'lucide-react';

export const AI_MODELS = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.0-flash-001', name: 'Gemini 2.0 Flash 001' },
    { id: 'gemini-2.0-flash-lite-001', name: 'Gemini 2.0 Flash-Lite 001' },
    { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash-Lite' },
    { id: 'gemini-2.5-flash-preview-tts', name: 'Gemini 2.5 Flash Preview TTS' },
    { id: 'gemini-2.5-pro-preview-tts', name: 'Gemini 2.5 Pro Preview TTS' },
    { id: 'gemma-4-26b-a4b-it', name: 'Gemma 4 26B A4B IT' },
    { id: 'gemma-4-31b-it', name: 'Gemma 4 31B IT' },
    { id: 'gemini-flash-latest', name: 'Gemini Flash Latest' },
    { id: 'gemini-flash-lite-latest', name: 'Gemini Flash-Lite Latest' },
    { id: 'gemini-pro-latest', name: 'Gemini Pro Latest' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite' },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview' },
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview' },
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview' },
    { id: 'gemini-3.1-pro-preview-customtools', name: 'Gemini 3.1 Pro Preview Custom Tools' },
    { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite Preview' },
    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite' },
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
    { id: 'gemini-robotics-er-1.5-preview', name: 'Gemini Robotics-ER 1.5 Preview' },
    { id: 'gemini-robotics-er-1.6-preview', name: 'Gemini Robotics-ER 1.6 Preview' }
];

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [selectedModel, setSelectedModel] = useState('gemini-1.5-pro'); // fallback
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const storedKey = localStorage.getItem('gemini_api_key');
            if (storedKey) setApiKey(storedKey);

            const storedModel = localStorage.getItem('gemini_model_id');
            if (storedModel) {
                setSelectedModel(storedModel);
            } else {
                setSelectedModel('gemini-2.5-flash'); // default new model
            }
            setIsSaved(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        localStorage.setItem('gemini_api_key', apiKey.trim());
        localStorage.setItem('gemini_model_id', selectedModel);
        setIsSaved(true);
        setTimeout(() => {
            onClose();
        }, 1000);
    };

    // Dùng createPortal để render modal thẳng vào document.body,
    // thoát khỏi mọi stacking context của component cha
    // (transform, filter, will-change, v.v.)
    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm font-body">
            <div className="w-full max-w-md bg-surface-900 border border-white/[0.08] rounded-2xl shadow-2xl p-6 relative animate-slideUp">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-display font-bold text-slate-100 mb-6 flex items-center gap-2">
                    <span className="text-accent-indigo">⚙️</span> Cài đặt Hệ thống
                </h2>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Gemini API Key
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Nhập API Key của bạn..."
                            className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-accent-indigo transition-colors"
                        />
                        <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
                            <AlertCircle size={14} className="flex-shrink-0" />
                            API Key được lưu trữ cục bộ trên trình duyệt của bạn (localStorage) và không gửi đến máy chủ của chúng tôi.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Mô hình AI (Model)
                        </label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-accent-indigo transition-colors appearance-none"
                        >
                            <option value="gemini-1.5-pro">Gemini 1.5 Pro (Mặc định cũ)</option>
                            {AI_MODELS.map(model => (
                                <option key={model.id} value={model.id}>
                                    {model.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 border-t border-white/[0.04]">
                        <button
                            onClick={handleSave}
                            className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl transition-all ${isSaved
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-accent-indigo hover:bg-accent-indigo-light text-white'
                                }`}
                        >
                            {isSaved ? 'Đã lưu cài đặt!' : (
                                <>
                                    <Save size={18} />
                                    Lưu thay đổi
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