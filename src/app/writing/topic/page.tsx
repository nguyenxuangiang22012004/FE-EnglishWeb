import { Suspense } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { TopicWritingView } from '@/components/pages/writing/TopicWritingView';

export const metadata = {
  title: 'Viết theo chủ đề — HELLOENGLISH',
  description: 'Luyện viết tiếng Anh theo chủ đề với gợi ý dàn ý bài viết và chấm chữa chi tiết bởi AI',
};

export default function TopicWritingPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="text-slate-400 p-8">Đang tải...</div>}>
        <TopicWritingView />
      </Suspense>
    </AppLayout>
  );
}
