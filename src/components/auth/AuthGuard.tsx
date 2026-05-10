'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { setToken } from '@/store/slices/authSlice';

const publicPaths = ['/auth/login', '/auth/signup', '/auth/forgot-password'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const [isChecking, setIsChecking] = useState(true);
    const token = useAppSelector((state) => state.auth.token);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        
        // If we have a token in localStorage but not in Redux state, sync it
        if (storedToken && !token) {
            dispatch(setToken(storedToken));
        }

        const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

        if (!storedToken && !isPublicPath) {
            // No token and trying to access private route
            router.push('/auth/login');
        } else if (storedToken && isPublicPath) {
            // Has token and trying to access login/signup
            router.push('/dashboard');
        } else {
            setIsChecking(false);
        }
    }, [pathname, token, dispatch, router]);

    if (isChecking) {
        return (
            <div className="min-h-screen bg-surface-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-accent-indigo border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return <>{children}</>;
}
