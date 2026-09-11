'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layers, Save } from 'lucide-react';
import { Topic, CreateTopicPayload } from '@/services/courseService';
import { CloudinaryImageUpload } from '@/components/admin/common/CloudinaryImageUpload';

interface TopicFormProps {
  mode: 'create' | 'edit';
  initialData?: Topic | null;
  onSubmit: (data: CreateTopicPayload) => void;
  isSubmitting?: boolean;
  backHref: string;
}

export const TopicForm: React.FC<TopicFormProps> = ({
  mode,
  initialData,
  onSubmit,
  isSubmitting = false,
  backHref,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [orderIndex, setOrderIndex] = useState(initialData?.orderIndex ?? 0);
  const [mascotImageUrl, setMascotImageUrl] = useState(initialData?.mascotImageUrl || '/mascot.jpg');
  const [introMessage, setIntroMessage] = useState(initialData?.introMessage || '');

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
    <form onSubmit={handleSubmit} className="bg-surface-800/60 border border-white/[0.06] rounded-2xl p-6 sm:p-8 backdrop-blur space-y-6">
      {/* Form header */}
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-4">
        <Layers size={18} className="text-blue-400" />
        <h2 className="text-lg font-bold text-white">
          {mode === 'create' ? 'Thông tin Chủ đề mới' : 'Chỉnh sửa thông tin Chủ đề'}
        </h2>
      </div>

      {/* Tên chủ đề */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-200">Tên chủ đề *</label>
        <input
          type="text"
          required
          placeholder="VD: Food & Drinks, Daily Routines, Traveling..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600"
        />
      </div>

      {/* Order Index */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-200">Thứ tự hiển thị (Order Index)</label>
        <input
          type="number"
          min={0}
          value={orderIndex}
          onChange={(e) => setOrderIndex(Number(e.target.value))}
          className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Mascot Image Upload */}
      <CloudinaryImageUpload
        label="Ảnh Mascot chủ đề"
        helperText="Tải lên ảnh Mascot đại diện cho chủ đề (JPG, PNG, WEBP, GIF tối đa 10MB)"
        folder="topics"
        value={mascotImageUrl}
        onChange={(url) => setMascotImageUrl(url)}
      />

      {/* Intro Message */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-200">Lời chào Mascot (Intro Message)</label>
        <textarea
          rows={2}
          placeholder="VD: Chào bạn! Cùng bắt đầu chủ đề học hôm nay thật hứng khởi nhé!"
          value={introMessage}
          onChange={(e) => setIntroMessage(e.target.value)}
          className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600 resize-none"
        />
      </div>

      {/* Mô tả */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-200">Mô tả chủ đề</label>
        <textarea
          rows={3}
          placeholder="VD: Học từ vựng và câu giao tiếp thực tế về đồ ăn uống..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
        <Link
          href={backHref}
          className="px-5 py-2.5 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
        >
          Hủy
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
        >
          <Save size={16} />
          {isSubmitting
            ? 'Đang lưu...'
            : mode === 'create'
            ? 'Tạo Chủ đề'
            : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  );
};

export default TopicForm;
