import { Suspense } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { QuizPage } from '@/components/pages/QuizPage';

export default function Page() {
    return (
        <AppLayout>
            <Suspense fallback={<div>Loading quiz...</div>}>
                <QuizPage />
            </Suspense>
        </AppLayout>
    );
}
