import { Suspense } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { TypingPage } from '@/components/pages/TypingPage';

export default function Page() {
    return (
        <AppLayout>
            <Suspense fallback={<div>Đang tải...</div>}>
                <TypingPage />
            </Suspense>
        </AppLayout>
    );
}
