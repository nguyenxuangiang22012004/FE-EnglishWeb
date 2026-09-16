import { Suspense } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { QuickReviewView } from '@/components/pages/writing/QuickReviewView';

export const metadata = {
  title: 'Chữa bài viết AI — HELLOENGLISH',
  description: 'Chữa bài viết tiếng Anh bằng AI: kiểm tra lỗi chính tả, ngữ pháp và đề xuất câu viết tốt hơn',
};

export default function WritingReviewPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="text-slate-400 p-8">Đang tải...</div>}>
        <QuickReviewView />
      </Suspense>
    </AppLayout>
  );
}
