'use client';

import React from 'react';
import { Provider } from 'react-redux';
import store from '@/store/index';
import AuthGuard from '@/components/auth/AuthGuard';
import { GoogleOAuthProvider } from '@react-oauth/google';

interface ProvidersProps {
    children: React.ReactNode;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export function Providers({ children }: ProvidersProps) {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <Provider store={store}>
                <AuthGuard>{children}</AuthGuard>
            </Provider>
        </GoogleOAuthProvider>
    );
}
