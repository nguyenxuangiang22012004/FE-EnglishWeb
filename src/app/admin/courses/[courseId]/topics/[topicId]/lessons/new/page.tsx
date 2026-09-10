'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Layers,
  FileText,
  ArrowLeft,
  ChevronRight,
  Save,
  Plus,
  Trash2,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { courseService, Course, Topic, LessonType } from '@/services/courseService';

export default function AdminNewLessonPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const topicId = params.topicId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  // Lesson basic fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState<LessonType>('VOCABULARY');
  const [orderIndex, setOrderIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Form states according to Type
  // 1. VOCABULARY
  const [vocabWord, setVocabWord] = useState('');
  const [vocabPronunciation, setVocabPronunciation] = useState('');
  const [vocabMeaning, setVocabMeaning] = useState('');
  const [vocabExample, setVocabExample] = useState('');

  // 2. FILL_BLANK
  const [fillSentence, setFillSentence] = useState('');
  const [fillAnswer, setFillAnswer] = useState('');

  // 3. SHADOWING
  const [shadowAudioText, setShadowAudioText] = useState('');

  // 4. SITUATION
  const [situationText, setSituationText] = useState('');

  // 5. CONVERSATION
  const [messages, setMessages] = useState<Array<{ text: string; isAI: boolean }>>([
    { text: 'Hello! How can I help you today?', isAI: true },
    { text: 'I want to order a coffee, please.', isAI: false },
  ]);

  useEffect(() => {
    const loadParentData = async () => {
      try {
        const [courseData, topicData] = await Promise.all([
          courseService.getCourseDetail(courseId),
          courseService.getTopicById(topicId),
        ]);
        setCourse(courseData);
        setTopic(topicData);
      } catch (err) {
        console.error('Failed to load parent data', err);
      } finally {
        setLoading(false);
      }
    };
    loadParentData();
  }, [courseId, topicId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
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

    setSubmitting(true);
    try {
      await courseService.createLesson(topicId, {
        title: title.trim(),
        type,
        orderIndex: Number(orderIndex) || 0,
        contentJson: JSON.stringify(contentObj),
      });
      router.push(`/admin/courses/${courseId}/topics/${topicId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi tạo bài làm');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/admin/courses" className="hover:text-white flex items-center gap-1.5 transition-colors">
          <BookOpen size={16} className="text-red-400" />
          Khóa học
        </Link>
        <ChevronRight size={14} className="text-slate-600" />
        <Link href={`/admin/courses/${courseId}`} className="hover:text-white flex items-center gap-1.5 transition-colors">
          <Layers size={16} className="text-blue-400" />
          {course?.name || 'Khóa học'}
        </Link>
        <ChevronRight size={14} className="text-slate-600" />
        <Link href={`/admin/courses/${courseId}/topics/${topicId}`} className="hover:text-white flex items-center gap-1.5 transition-colors">
          <FileText size={16} className="text-emerald-400" />
          {topic?.name || 'Chủ đề'}
        </Link>
        <ChevronRight size={14} className="text-slate-600" />
        <span className="text-white font-semibold">Tạo bài làm mới</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FileText size={24} className="text-emerald-400" />
          Thêm Bài làm mới
        </h1>
        <Link
          href={`/admin/courses/${courseId}/topics/${topicId}`}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm"
        >
          <ArrowLeft size={16} /> Quay lại Chủ đề
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-surface-800/60 border border-white/[0.06] rounded-2xl p-6 sm:p-8 backdrop-blur space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-slate-200">Tiêu đề bài làm *</label>
            <input
              type="text"
              required
              placeholder="VD: Từ vựng: Delicious, Luyện nói câu..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">Thứ tự hiển thị (Order)</label>
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200">Chọn dạng bài tập *</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { id: 'VOCABULARY', label: '1. Từ vựng' },
              { id: 'FILL_BLANK', label: '2. Điền từ' },
              { id: 'SHADOWING', label: '3. Shadowing' },
              { id: 'SITUATION', label: '4. Tình huống' },
              { id: 'CONVERSATION', label: '5. Hội thoại' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id as LessonType)}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  type === t.id
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm'
                    : 'bg-surface-900 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Fields by Type */}
        <div className="border-t border-white/[0.06] pt-5">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">
            Cấu hình nội dung cho dạng bài: {type}
          </h3>

          {/* Dạng 1: VOCABULARY */}
          {type === 'VOCABULARY' && (
            <div className="space-y-4 bg-surface-900/60 p-5 rounded-xl border border-white/5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Từ vựng tiếng Anh (Word) *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Delicious"
                    value={vocabWord}
                    onChange={(e) => setVocabWord(e.target.value)}
                    className="w-full bg-surface-800 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Phiên âm IPA</label>
                  <input
                    type="text"
                    placeholder="VD: /dɪˈlɪʃəs/"
                    value={vocabPronunciation}
                    onChange={(e) => setVocabPronunciation(e.target.value)}
                    className="w-full bg-surface-800 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Nghĩa tiếng Việt *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Thơm ngon, ngon miệng"
                  value={vocabMeaning}
                  onChange={(e) => setVocabMeaning(e.target.value)}
                  className="w-full bg-surface-800 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Câu ví dụ minh họa</label>
                <input
                  type="text"
                  placeholder="VD: This soup is absolutely delicious."
                  value={vocabExample}
                  onChange={(e) => setVocabExample(e.target.value)}
                  className="w-full bg-surface-800 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white"
                />
              </div>
            </div>
          )}

          {/* Dạng 2: FILL_BLANK */}
          {type === 'FILL_BLANK' && (
            <div className="space-y-4 bg-surface-900/60 p-5 rounded-xl border border-white/5">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Câu hỏi tiếng Anh (dùng <code className="text-yellow-400 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded">___</code> cho vị trí trống) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: She ___ to school every day."
                  value={fillSentence}
                  onChange={(e) => setFillSentence(e.target.value)}
                  className="w-full bg-surface-800 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Đáp án đúng cần điền *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: goes"
                  value={fillAnswer}
                  onChange={(e) => setFillAnswer(e.target.value)}
                  className="w-full bg-surface-800 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white"
                />
              </div>
            </div>
          )}

          {/* Dạng 3: SHADOWING */}
          {type === 'SHADOWING' && (
            <div className="space-y-4 bg-surface-900/60 p-5 rounded-xl border border-white/5">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Câu mẫu tiếng Anh để luyện đọc ngữ điệu *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="VD: Good morning! How can I help you today?"
                  value={shadowAudioText}
                  onChange={(e) => setShadowAudioText(e.target.value)}
                  className="w-full bg-surface-800 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <HelpCircle size={14} className="text-blue-400" />
                <span>Học viên sẽ được nghe máy đọc câu này và ghi âm lặp lại ngữ điệu theo mẫu.</span>
              </div>
            </div>
          )}

          {/* Dạng 4: SITUATION */}
          {type === 'SITUATION' && (
            <div className="space-y-4 bg-surface-900/60 p-5 rounded-xl border border-white/5">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Mô tả tình huống phản xạ *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="VD: Bạn đang ở nhà hàng và muốn gọi một cốc nước cam. Hãy nói với bồi bàn bằng tiếng Anh."
                  value={situationText}
                  onChange={(e) => setSituationText(e.target.value)}
                  className="w-full bg-surface-800 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white"
                />
              </div>
            </div>
          )}

          {/* Dạng 5: CONVERSATION */}
          {type === 'CONVERSATION' && (
            <div className="space-y-4 bg-surface-900/60 p-5 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Danh sách các câu thoại hội thoại</label>
                <button
                  type="button"
                  onClick={handleAddMessage}
                  className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20"
                >
                  <Plus size={13} /> Thêm câu thoại
                </button>
              </div>

              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-surface-800 p-3 rounded-xl border border-white/5">
                    <select
                      value={msg.isAI ? 'AI' : 'USER'}
                      onChange={(e) => handleMessageChange(idx, msg.text, e.target.value === 'AI')}
                      className={`text-xs px-2.5 py-2 rounded-lg border font-semibold ${
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
                      placeholder={msg.isAI ? 'Tin nhắn của AI...' : 'Tin nhắn của học viên...'}
                      value={msg.text}
                      onChange={(e) => handleMessageChange(idx, e.target.value, msg.isAI)}
                      className="flex-1 bg-surface-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                    />

                    {messages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMessage(idx)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/[0.06]">
          <Link
            href={`/admin/courses/${courseId}/topics/${topicId}`}
            className="px-5 py-2.5 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
          >
            <Save size={16} />
            {submitting ? 'Đang tạo...' : 'Tạo Bài làm'}
          </button>
        </div>
      </form>
    </div>
  );
}
