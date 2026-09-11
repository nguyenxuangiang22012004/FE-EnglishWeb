import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-surface-900 flex items-center justify-center text-slate-400">Đang tải...</div>}>
            <LoginForm />
        </Suspense>
    );
}
