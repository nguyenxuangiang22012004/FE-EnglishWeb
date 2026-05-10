'use client';

import React from 'react';
import { Provider } from 'react-redux';
import store from '@/store/index';
import AuthGuard from '@/components/auth/AuthGuard';

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <Provider store={store}>
            <AuthGuard>{children}</AuthGuard>
        </Provider>
    );
}
