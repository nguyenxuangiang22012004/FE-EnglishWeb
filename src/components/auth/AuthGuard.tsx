'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { setToken, logout } from '@/store/slices/authSlice';
import { jwtDecode } from 'jwt-decode';

const publicPaths = ['/auth/login', '/auth/signup', '/auth/forgot-password'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const [isChecking, setIsChecking] = useState(true);
    const token = useAppSelector((state) => state.auth.token);

    const checkAuth = () => {
        const storedToken = localStorage.getItem('token');
        const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

        if (!storedToken) {
            if (!isPublicPath) {
                // No token and trying to access private route
                router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
            } else {
                setIsChecking(false);
            }
            return;
        }

        // Check if token is expired
        try {
            const decoded: any = jwtDecode(storedToken);
            const currentTime = Date.now() / 1000;
            
            if (decoded.exp && decoded.exp < currentTime) {
                // Token expired
                localStorage.removeItem('token');
                dispatch(logout());
                if (!isPublicPath) {
                    router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
                } else {
                    setIsChecking(false);
                }
                return;
            }

            // Token is valid, sync to Redux if needed
            if (!token) {
                dispatch(setToken(storedToken));
            }

            if (isPublicPath) {
                // Has valid token and trying to access login/signup
                router.push('/dashboard');
            } else {
                setIsChecking(false);
            }
        } catch (error) {
            // Invalid token
            localStorage.removeItem('token');
            dispatch(logout());
            if (!isPublicPath) {
                router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
            } else {
                setIsChecking(false);
            }
        }
    };

    useEffect(() => {
        checkAuth();
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
