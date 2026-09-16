import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, AlertCircle } from 'lucide-react';

export const AI_MODELS = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Khuyên dùng)' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Cao cấp)' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash-Lite (Tốc độ cao)' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
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
        let finalModelId = selectedModel.trim();
        
        // Cố gắng tìm model theo tên (bỏ qua hoa/thường)
        const matchedModel = AI_MODELS.find(m => m.name.toLowerCase() === finalModelId.toLowerCase());
        
        if (matchedModel) {
            finalModelId = matchedModel.id;
        } else {
            // Tự động chuyển đổi: chữ thường, thay khoảng trắng bằng dấu gạch ngang
            finalModelId = finalModelId
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9.-]/g, '');
        }

        localStorage.setItem('gemini_api_key', apiKey.trim());
        localStorage.setItem('gemini_model_id', finalModelId);
        
        // Cập nhật lại state để hiển thị id chuẩn nếu người dùng mở lại
        setSelectedModel(finalModelId);
        
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
                        <input
                            type="text"
                            list="model-suggestions"
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            placeholder="Nhập tên mô hình AI (VD: gemini-2.5-flash)..."
                            className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-accent-indigo transition-colors"
                        />
                        <datalist id="model-suggestions">
                            {AI_MODELS.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </datalist>
                        <p className="text-xs text-slate-500 mt-1.5">
                            Bạn có thể tự nhập bất kỳ model ID nào (VD: <code>gemini-2.5-flash</code>, <code>gemini-2.0-flash</code>, <code>gemini-1.5-pro</code>...).
                        </p>
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