import { Suspense } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { WritingHistoryView } from '@/components/pages/writing/WritingHistoryView';

export const metadata = {
  title: 'Lịch sử & Phân tích Tiến độ Luyện Viết — HELLOENGLISH',
  description: 'Theo dõi tiến độ luyện viết tiếng Anh, thống kê lỗi ngữ pháp hay gặp và xem lại các bài viết cũ',
};

export default function WritingHistoryPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="text-slate-400 p-8">Đang tải dữ liệu lịch sử...</div>}>
        <WritingHistoryView />
      </Suspense>
    </AppLayout>
  );
}
