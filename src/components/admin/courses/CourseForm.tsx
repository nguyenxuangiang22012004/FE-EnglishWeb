'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Save } from 'lucide-react';
import { Course, CreateCoursePayload } from '@/services/courseService';
import { CloudinaryImageUpload } from '@/components/admin/common/CloudinaryImageUpload';

interface CourseFormProps {
  mode: 'create' | 'edit';
  initialData?: Course | null;
  onSubmit: (data: CreateCoursePayload) => void;
  isSubmitting?: boolean;
  backHref: string;
}

export const CourseForm: React.FC<CourseFormProps> = ({
  mode,
  initialData,
  onSubmit,
  isSubmitting = false,
  backHref,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [level, setLevel] = useState(initialData?.level || 'Beginner');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');

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

  const accentColor = 'red';

  return (
    <form onSubmit={handleSubmit} className="bg-surface-800/60 border border-white/[0.06] rounded-2xl p-6 sm:p-8 backdrop-blur space-y-6">
      {/* Form header */}
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-4">
        <BookOpen size={18} className="text-red-400" />
        <h2 className="text-lg font-bold text-white">
          {mode === 'create' ? 'Thông tin Khóa học mới' : 'Chỉnh sửa thông tin Khóa học'}
        </h2>
      </div>

      {/* Tên khóa học */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-200">Tên khóa học *</label>
        <input
          type="text"
          required
          placeholder="VD: Tiếng Anh Giao Tiếp Hàng Ngày"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors placeholder-slate-600"
        />
      </div>

      {/* Level */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-200">Cấp độ (Level)</label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
        >
          <option value="Beginner">Beginner (Cơ bản A1–A2)</option>
          <option value="Intermediate">Intermediate (Trung cấp B1–B2)</option>
          <option value="Advanced">Advanced (Nâng cao C1–C2)</option>
          <option value="All Levels">All Levels (Mọi trình độ)</option>
        </select>
      </div>

      {/* Cloudinary Image Upload */}
      <CloudinaryImageUpload
        label="Ảnh bìa khóa học"
        helperText="Tải lên hình ảnh đại diện cho khóa học (JPG, PNG, WEBP, GIF tối đa 10MB)"
        folder="courses"
        value={imageUrl}
        onChange={(url) => setImageUrl(url)}
      />

      {/* Mô tả */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-200">Mô tả khóa học</label>
        <textarea
          rows={4}
          placeholder="VD: Khóa học giúp bạn tự tin giao tiếp qua các tình huống thực tế..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors placeholder-slate-600 resize-none"
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
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl shadow-lg shadow-red-500/20 disabled:opacity-50 transition-all"
        >
          <Save size={16} />
          {isSubmitting
            ? 'Đang lưu...'
            : mode === 'create'
            ? 'Tạo Khóa học'
            : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
