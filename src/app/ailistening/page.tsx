import { Suspense } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { AIListeningPage } from '@/components/pages/ailistening/AIListeningPage';

export const metadata = {
  title: 'Luyện Nghe — HELLOENGLISH',
  description: 'Luyện nghe tiếng anh từ AI giúp bạn nghe tốt và hiệu quả hơn',
};

export default function Page() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="text-slate-400 p-8">Đang tải...</div>}>
        <AIListeningPage />
      </Suspense>
    </AppLayout>
  );
}
