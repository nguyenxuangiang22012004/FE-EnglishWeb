'use client';

import React, { useState } from 'react';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import { LessonType } from '@/services/courseService';

interface LessonFormProps {
  initialTitle?: string;
  initialType?: LessonType;
  initialOrderIndex?: number;
  initialContentJson?: string;
  onSubmit: (data: { title: string; type: LessonType; orderIndex: number; contentJson: string }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const LessonFormModal: React.FC<LessonFormProps> = ({
  initialTitle = '',
  initialType = 'VOCABULARY',
  initialOrderIndex = 0,
  initialContentJson = '',
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [type, setType] = useState<LessonType>(initialType);
  const [orderIndex, setOrderIndex] = useState(initialOrderIndex);

  // Parse initial json
  const parseInitialContent = () => {
    try {
      if (!initialContentJson) return {};
      return typeof initialContentJson === 'string' ? JSON.parse(initialContentJson) : initialContentJson;
    } catch {
      return {};
    }
  };

  const initialObj = parseInitialContent();

  // State for VOCABULARY
  const [vocabWord, setVocabWord] = useState(initialObj.word || '');
  const [vocabPronunciation, setVocabPronunciation] = useState(initialObj.pronunciation || '');
  const [vocabMeaning, setVocabMeaning] = useState(initialObj.meaning || '');
  const [vocabExample, setVocabExample] = useState(initialObj.example || '');

  // State for FILL_BLANK
  const [fillSentence, setFillSentence] = useState(initialObj.sentence || '');
  const [fillAnswer, setFillAnswer] = useState(initialObj.answer || '');

  // State for SHADOWING
  const [shadowAudioText, setShadowAudioText] = useState(initialObj.audioText || '');

  // State for SITUATION
  const [situationText, setSituationText] = useState(initialObj.situation || '');

  // State for CONVERSATION
  const [messages, setMessages] = useState<Array<{ text: string; isAI: boolean }>>(
    Array.isArray(initialObj.messages) ? initialObj.messages : [{ text: '', isAI: true }]
  );

  const handleAddMessage = () => {
    const lastIsAI = messages.length > 0 ? messages[messages.length - 1].isAI : false;
    setMessages([...messages, { text: '', isAI: !lastIsAI }]);
  };

  const handleRemoveMessage = (index: number) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  const handleMessageChange = (index: number, text: string, isAI: boolean) => {
    const updated = [...messages];
    updated[index] = { text, isAI };
    setMessages(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề bài học');
      return;
    }

    let contentObj: any = {};

    switch (type) {
      case 'VOCABULARY':
        contentObj = {
          word: vocabWord.trim(),
          pronunciation: vocabPronunciation.trim(),
          meaning: vocabMeaning.trim(),
          example: vocabExample.trim(),
        };
        break;
      case 'FILL_BLANK':
        contentObj = {
          sentence: fillSentence.trim(),
          answer: fillAnswer.trim(),
        };
        break;
      case 'SHADOWING':
        contentObj = {
          audioText: shadowAudioText.trim(),
        };
        break;
      case 'SITUATION':
        contentObj = {
          situation: situationText.trim(),
        };
        break;
      case 'CONVERSATION':
        contentObj = {
          messages: messages.filter((m) => m.text.trim().length > 0),
        };
        break;
    }

    onSubmit({
      title: title.trim(),
      type,
      orderIndex: Number(orderIndex) || 0,
      contentJson: JSON.stringify(contentObj),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {initialTitle ? 'Chỉnh sửa bài làm' : 'Thêm bài làm mới'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-white/5"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* General Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tiêu đề bài làm *</label>
              <input
                type="text"
                required
                placeholder="VD: Từ vựng: Apple, Luyện nói câu..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-surface-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Thứ tự (Order)</label>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                className="w-full bg-surface-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Dạng bài tập *</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'VOCABULARY', label: 'Từ vựng' },
                { id: 'FILL_BLANK', label: 'Điền từ' },
                { id: 'SHADOWING', label: 'Shadowing' },
                { id: 'SITUATION', label: 'Tình huống' },
                { id: 'CONVERSATION', label: 'Hội thoại' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as LessonType)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium border transition-all text-center ${
                    type === t.id
                      ? 'bg-red-500/20 border-red-500/50 text-red-300 shadow-sm'
                      : 'bg-surface-800 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">
              Nội dung chi tiết theo dạng ({type})
            </h3>

            {/* Dạng 1: VOCABULARY */}
            {type === 'VOCABULARY' && (
              <div className="space-y-3 bg-surface-800/40 p-4 rounded-xl border border-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Từ vựng (Word) *</label>
                    <input
                      type="text"
                      placeholder="VD: Delicious"
                      value={vocabWord}
                      onChange={(e) => setVocabWord(e.target.value)}
                      className="w-full bg-surface-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Phiên âm IPA</label>
                    <input
                      type="text"
                      placeholder="VD: /dɪˈlɪʃəs/"
                      value={vocabPronunciation}
                      onChange={(e) => setVocabPronunciation(e.target.value)}
                      className="w-full bg-surface-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Ý nghĩa tiếng Việt *</label>
                  <input
                    type="text"
                    placeholder="VD: Thơm ngon, ngon miệng"
                    value={vocabMeaning}
                    onChange={(e) => setVocabMeaning(e.target.value)}
                    className="w-full bg-surface-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Câu ví dụ minh họa</label>
                  <input
                    type="text"
                    placeholder="VD: This soup is absolutely delicious."
                    value={vocabExample}
                    onChange={(e) => setVocabExample(e.target.value)}
                    className="w-full bg-surface-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
            )}

            {/* Dạng 2: FILL_BLANK */}
            {type === 'FILL_BLANK' && (
              <div className="space-y-3 bg-surface-800/40 p-4 rounded-xl border border-white/5">
                <div>
                  <label className="text-xs text-slate-400 block mb-1 flex items-center justify-between">
                    <span>Câu hỏi (dùng <code className="text-yellow-400 font-bold bg-yellow-500/10 px-1 rounded">___</code> cho vị trí trống) *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: She ___ to school every day."
                    value={fillSentence}
                    onChange={(e) => setFillSentence(e.target.value)}
                    className="w-full bg-surface-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Đáp án đúng *</label>
                  <input
                    type="text"
                    placeholder="VD: goes"
                    value={fillAnswer}
                    onChange={(e) => setFillAnswer(e.target.value)}
                    className="w-full bg-surface-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
            )}

            {/* Dạng 3: SHADOWING */}
            {type === 'SHADOWING' && (
              <div className="space-y-3 bg-surface-800/40 p-4 rounded-xl border border-white/5">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Câu tiếng Anh mẫu cần luyện đọc *</label>
                  <textarea
                    rows={3}
                    placeholder="VD: Good morning! How can I help you today?"
                    value={shadowAudioText}
                    onChange={(e) => setShadowAudioText(e.target.value)}
                    className="w-full bg-surface-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <HelpCircle size={14} className="text-blue-400" />
                  <span>Hệ thống sẽ tự động phát âm mẫu bằng Text-to-Speech và học viên sẽ ghi âm đọc theo.</span>
                </div>
              </div>
            )}

            {/* Dạng 4: SITUATION */}
            {type === 'SITUATION' && (
              <div className="space-y-3 bg-surface-800/40 p-4 rounded-xl border border-white/5">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Mô tả tình huống phản xạ *</label>
                  <textarea
                    rows={4}
                    placeholder="VD: Bạn đang ở trong nhà hàng và muốn gọi một cốc nước cam. Hãy nói với bồi bàn bằng tiếng Anh."
                    value={situationText}
                    onChange={(e) => setSituationText(e.target.value)}
                    className="w-full bg-surface-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
            )}

            {/* Dạng 5: CONVERSATION */}
            {type === 'CONVERSATION' && (
              <div className="space-y-3 bg-surface-800/40 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300 font-semibold">Danh sách câu thoại hội thoại</label>
                  <button
                    type="button"
                    onClick={handleAddMessage}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20"
                  >
                    <Plus size={12} /> Thêm câu thoại
                  </button>
                </div>

                <div className="space-y-2.5 mt-2">
                  {messages.map((msg, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-surface-900/80 p-2.5 rounded-xl border border-white/5">
                      <select
                        value={msg.isAI ? 'AI' : 'USER'}
                        onChange={(e) => handleMessageChange(idx, msg.text, e.target.value === 'AI')}
                        className={`text-xs px-2 py-1.5 rounded-lg border font-semibold ${
                          msg.isAI
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}
                      >
                        <option value="AI">Bot / AI</option>
                        <option value="USER">Học viên</option>
                      </select>

                      <input
                        type="text"
                        placeholder={msg.isAI ? 'Tin nhắn của AI...' : 'Tin nhắn của người học...'}
                        value={msg.text}
                        onChange={(e) => handleMessageChange(idx, e.target.value, msg.isAI)}
                        className="flex-1 bg-surface-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                      />

                      {messages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMessage(idx)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl shadow-lg shadow-red-500/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Đang lưu...' : initialTitle ? 'Lưu thay đổi' : 'Tạo bài làm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
