'use client';

import React, { useState } from 'react';
import { Course } from '@/services/courseService';

interface CourseFormProps {
  initialCourse?: Course | null;
  onSubmit: (data: {
    name: string;
    description: string;
    level: string;
    imageUrl: string;
  }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const CourseFormModal: React.FC<CourseFormProps> = ({
  initialCourse,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [name, setName] = useState(initialCourse?.name || '');
  const [description, setDescription] = useState(initialCourse?.description || '');
  const [level, setLevel] = useState(initialCourse?.level || 'Beginner');
  const [imageUrl, setImageUrl] = useState(initialCourse?.imageUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên khóa học');
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      level: level.trim(),
      imageUrl: imageUrl.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {initialCourse ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
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
            <label className="text-xs font-semibold text-slate-300">Tên khóa học *</label>
            <input
              type="text"
              required
              placeholder="VD: Tiếng Anh Giao Tiếp Cơ Bản"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Cấp độ (Level)</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-surface-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="Beginner">Beginner (A1 - A2)</option>
                <option value="Intermediate">Intermediate (B1 - B2)</option>
                <option value="Advanced">Advanced (C1 - C2)</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Đường dẫn ảnh bìa</label>
              <input
                type="text"
                placeholder="VD: /images/course.png hoặc URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-surface-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Mô tả khóa học</label>
            <textarea
              rows={3}
              placeholder="VD: Khóa học giúp bạn nắm vững kiến thức căn bản..."
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
              {isSubmitting ? 'Đang lưu...' : initialCourse ? 'Cập nhật' : 'Tạo khóa học'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
