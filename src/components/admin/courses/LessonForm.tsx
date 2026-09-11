'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, Save, Plus, Trash2, HelpCircle } from 'lucide-react';
import { Lesson, LessonType, CreateLessonPayload } from '@/services/courseService';

interface LessonFormProps {
  mode: 'create' | 'edit';
  initialData?: Lesson | null;
  onSubmit: (data: CreateLessonPayload) => void;
  isSubmitting?: boolean;
  backHref: string;
}

export const LessonForm: React.FC<LessonFormProps> = ({
  mode,
  initialData,
  onSubmit,
  isSubmitting = false,
  backHref,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState<LessonType>(initialData?.type || 'VOCABULARY');
  const [orderIndex, setOrderIndex] = useState(initialData?.orderIndex ?? 0);

  // Parse initial content JSON
  const parseContent = () => {
    try {
      if (!initialData?.contentJson) return {};
      return typeof initialData.contentJson === 'string'
        ? JSON.parse(initialData.contentJson)
        : initialData.contentJson;
    } catch {
      return {};
    }
  };
  const initObj = parseContent();

  // VOCABULARY
  const [vocabWord, setVocabWord] = useState(initObj.word || '');
  const [vocabPronunciation, setVocabPronunciation] = useState(initObj.pronunciation || '');
  const [vocabMeaning, setVocabMeaning] = useState(initObj.meaning || '');
  const [vocabExample, setVocabExample] = useState(initObj.example || '');

  // FILL_BLANK
  const [fillSentence, setFillSentence] = useState(initObj.sentence || '');
  const [fillAnswer, setFillAnswer] = useState(initObj.answer || '');

  // SHADOWING
  const [shadowAudioText, setShadowAudioText] = useState(initObj.audioText || '');

  // SITUATION
  const [situationText, setSituationText] = useState(initObj.situation || '');

  // CONVERSATION
  const [messages, setMessages] = useState<Array<{ text: string; isAI: boolean }>>(
    Array.isArray(initObj.messages) ? initObj.messages : [{ text: '', isAI: true }]
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
      alert('Vui lòng nhập tiêu đề bài làm');
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
        contentObj = { sentence: fillSentence.trim(), answer: fillAnswer.trim() };
        break;
      case 'SHADOWING':
        contentObj = { audioText: shadowAudioText.trim() };
        break;
      case 'SITUATION':
        contentObj = { situation: situationText.trim() };
        break;
      case 'CONVERSATION':
        contentObj = { messages: messages.filter((m) => m.text.trim().length > 0) };
        break;
    }

    onSubmit({
      title: title.trim(),
      type,
      orderIndex: Number(orderIndex) || 0,
      contentJson: JSON.stringify(contentObj),
    });
  };

  const lessonTypes = [
    { id: 'VOCABULARY', label: 'Từ vựng', color: 'emerald' },
    { id: 'FILL_BLANK', label: 'Điền từ', color: 'amber' },
    { id: 'SHADOWING', label: 'Shadowing', color: 'blue' },
    { id: 'SITUATION', label: 'Tình huống', color: 'indigo' },
    { id: 'CONVERSATION', label: 'Hội thoại', color: 'purple' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form header */}
      <div className="bg-surface-800/60 border border-white/[0.06] rounded-2xl p-6 sm:p-8 backdrop-blur space-y-6">
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-4">
          <FileText size={18} className="text-emerald-400" />
          <h2 className="text-lg font-bold text-white">
            {mode === 'create' ? 'Thông tin Bài làm mới' : 'Chỉnh sửa thông tin Bài làm'}
          </h2>
        </div>

        {/* Title + Order */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-slate-200">Tiêu đề bài làm *</label>
            <input
              type="text"
              required
              placeholder="VD: Từ vựng: Apple, Luyện nói câu chào hỏi..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">Thứ tự (Order)</label>
            <input
              type="number"
              min={0}
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Lesson Type Selector */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200">Dạng bài tập *</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {lessonTypes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id as LessonType)}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  type === t.id
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm'
                    : 'bg-surface-900 border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-surface-800/60 border border-white/[0.06] rounded-2xl p-6 sm:p-8 backdrop-blur space-y-5">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
            Nội dung chi tiết — {type}
          </h3>
        </div>

        {/* VOCABULARY */}
        {type === 'VOCABULARY' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Từ vựng (Word) *</label>
                <input
                  type="text"
                  placeholder="VD: Delicious"
                  value={vocabWord}
                  onChange={(e) => setVocabWord(e.target.value)}
                  className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Phiên âm IPA</label>
                <input
                  type="text"
                  placeholder="VD: /dɪˈlɪʃəs/"
                  value={vocabPronunciation}
                  onChange={(e) => setVocabPronunciation(e.target.value)}
                  className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Ý nghĩa tiếng Việt *</label>
              <input
                type="text"
                placeholder="VD: Thơm ngon, ngon miệng"
                value={vocabMeaning}
                onChange={(e) => setVocabMeaning(e.target.value)}
                className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Câu ví dụ minh họa</label>
              <input
                type="text"
                placeholder="VD: This soup is absolutely delicious."
                value={vocabExample}
                onChange={(e) => setVocabExample(e.target.value)}
                className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600"
              />
            </div>
          </div>
        )}

        {/* FILL_BLANK */}
        {type === 'FILL_BLANK' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">
                Câu hỏi (dùng <code className="text-amber-400 bg-amber-500/10 px-1 rounded font-bold">___</code> cho vị trí trống) *
              </label>
              <input
                type="text"
                placeholder="VD: She ___ to school every day."
                value={fillSentence}
                onChange={(e) => setFillSentence(e.target.value)}
                className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Đáp án đúng *</label>
              <input
                type="text"
                placeholder="VD: goes"
                value={fillAnswer}
                onChange={(e) => setFillAnswer(e.target.value)}
                className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600"
              />
            </div>
          </div>
        )}

        {/* SHADOWING */}
        {type === 'SHADOWING' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Câu tiếng Anh mẫu cần luyện đọc *</label>
              <textarea
                rows={4}
                placeholder="VD: Good morning! How can I help you today?"
                value={shadowAudioText}
                onChange={(e) => setShadowAudioText(e.target.value)}
                className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600 resize-none"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
              <HelpCircle size={14} className="text-blue-400 flex-shrink-0" />
              <span>Hệ thống sẽ tự động phát âm mẫu bằng Text-to-Speech và học viên sẽ ghi âm đọc theo.</span>
            </div>
          </div>
        )}

        {/* SITUATION */}
        {type === 'SITUATION' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Mô tả tình huống phản xạ *</label>
            <textarea
              rows={5}
              placeholder="VD: Bạn đang ở trong nhà hàng và muốn gọi một cốc nước cam. Hãy nói với bồi bàn bằng tiếng Anh."
              value={situationText}
              onChange={(e) => setSituationText(e.target.value)}
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-600 resize-none"
            />
          </div>
        )}

        {/* CONVERSATION */}
        {type === 'CONVERSATION' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Danh sách câu thoại hội thoại</label>
              <button
                type="button"
                onClick={handleAddMessage}
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all"
              >
                <Plus size={12} /> Thêm câu thoại
              </button>
            </div>

            <div className="space-y-2">
              {messages.map((msg, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-surface-900/80 p-2.5 rounded-xl border border-white/[0.05]">
                  <select
                    value={msg.isAI ? 'AI' : 'USER'}
                    onChange={(e) => handleMessageChange(idx, msg.text, e.target.value === 'AI')}
                    className={`text-xs px-2 py-1.5 rounded-lg border font-semibold flex-shrink-0 ${
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
                    className="flex-1 bg-surface-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder-slate-600"
                  />

                  {messages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMessage(idx)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
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

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="px-5 py-2.5 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
        >
          Hủy
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
        >
          <Save size={16} />
          {isSubmitting
            ? 'Đang lưu...'
            : mode === 'create'
            ? 'Tạo Bài làm'
            : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  );
};

export default LessonForm;
