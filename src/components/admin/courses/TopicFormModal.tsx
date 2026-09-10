'use client';

import React, { useState } from 'react';
import { Topic } from '@/services/courseService';

interface TopicFormProps {
  initialTopic?: Topic | null;
  onSubmit: (data: {
    name: string;
    description: string;
    orderIndex: number;
    mascotImageUrl: string;
    introMessage: string;
  }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const TopicFormModal: React.FC<TopicFormProps> = ({
  initialTopic,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [name, setName] = useState(initialTopic?.name || '');
  const [description, setDescription] = useState(initialTopic?.description || '');
  const [orderIndex, setOrderIndex] = useState(initialTopic?.orderIndex || 0);
  const [mascotImageUrl, setMascotImageUrl] = useState(initialTopic?.mascotImageUrl || '');
  const [introMessage, setIntroMessage] = useState(initialTopic?.introMessage || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên chủ đề');
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      orderIndex: Number(orderIndex) || 0,
      mascotImageUrl: mascotImageUrl.trim(),
      introMessage: introMessage.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {initialTopic ? 'Chỉnh sửa chủ đề' : 'Thêm chủ đề mới'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-white/5"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Tên chủ đề *</label>
            <input
              type="text"
              required
              placeholder="VD: Food & Drinks, Greetings, Traveling..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Thứ tự hiển thị (Order)</label>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                className="w-full bg-surface-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">URL ảnh Mascot</label>
              <input
                type="text"
                placeholder="VD: /mascot.jpg hoặc https://..."
                value={mascotImageUrl}
                onChange={(e) => setMascotImageUrl(e.target.value)}
                className="w-full bg-surface-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Lời chào của Mascot (Intro Message)</label>
            <textarea
              rows={2}
              placeholder="VD: Chào mừng bạn đến với chủ đề Đồ ăn & Đồ uống! Cùng bắt đầu học nhé!"
              value={introMessage}
              onChange={(e) => setIntroMessage(e.target.value)}
              className="w-full bg-surface-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Mô tả ngắn</label>
            <textarea
              rows={2}
              placeholder="VD: Học từ vựng và câu giao tiếp thực tế về đồ ăn uống..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
            />
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
              {isSubmitting ? 'Đang lưu...' : initialTopic ? 'Cập nhật' : 'Tạo chủ đề'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
