import React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layouts/AppLayout';
import { PenTool, Sparkles, BookOpen, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Luyện Viết AI — HELLOENGLISH',
  description: 'Trung tâm luyện viết tiếng Anh thông minh với AI',
};

export default function WritingHubPage() {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 py-4 font-body">
        {/* Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-indigo/10 border border-accent-indigo/20 text-accent-indigo-light text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            Hệ Thống Luyện Viết Thông Minh
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Nâng Cao Kỹ Năng Viết Tiếng Anh Với AI
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Chọn phương thức luyện tập phù hợp với mục tiêu của bạn: Viết theo chủ đề với gợi ý dàn ý hoặc dán bài viết để AI phân tích lỗi chi tiết.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Card 1: Viết theo chủ đề */}
          <Link
            href="/writing/topic"
            className="group relative bg-surface-800 border border-white/[0.08] hover:border-accent-indigo/50 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-accent-indigo/10 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-indigo/10 rounded-full blur-3xl pointer-events-none group-hover:bg-accent-indigo/20 transition-colors" />

            <div className="space-y-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-accent-indigo group-hover:text-white transition-all duration-300 shadow-md">
                <PenTool size={26} />
              </div>

              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Tính năng đề xuất
                </span>
                <h2 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Viết theo chủ đề
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Nhập chủ đề tùy ý hoặc chọn chủ đề mẫu. AI sẽ tự động sinh đề bài, bộ câu hỏi định hướng, từ vựng và <strong className="text-slate-200">gợi ý dàn ý bài viết</strong> chi tiết.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span>Gợi ý dàn ý 3 phần (Mở bài, Thân bài, Kết bài)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span>Bộ từ vựng đắt giá theo từng chủ đề</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span>Phòng viết có đồng hồ & đếm từ thời gian thực</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-sm font-semibold text-accent-indigo-light group-hover:text-white transition-colors relative z-10">
              <span>Bắt đầu viết ngay</span>
              <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Chữa bài viết AI */}
          <Link
            href="/writing/review"
            className="group relative bg-surface-800 border border-white/[0.08] hover:border-emerald-500/50 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />

            <div className="space-y-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-md">
                <Sparkles size={26} />
              </div>

              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Phản hồi tức thì
                </span>
                <h2 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Chữa bài viết AI
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Dán trực tiếp bất kỳ đoạn văn hoặc bài luận nào. AI kiểm tra từng lỗi chính tả, phân tích sai ngữ pháp và đề xuất các câu viết lại tự nhiên, học thuật hơn.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span>Phát hiện & sửa lỗi chính tả, ngữ pháp chi tiết</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span>Đề xuất câu viết lại nâng band điểm</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span>Đánh giá điểm số & nhận xét tổng quan bằng tiếng Việt</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-sm font-semibold text-emerald-400 group-hover:text-white transition-colors relative z-10">
              <span>Chữa bài ngay</span>
              <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
