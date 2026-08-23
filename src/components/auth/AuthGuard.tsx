'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { setToken, setUser, logout } from '@/store/slices/authSlice';
import { jwtDecode } from 'jwt-decode';
import { getUserFromToken } from '@/utils/auth';

const publicPaths = ['/auth/login', '/auth/signup', '/auth/forgot-password'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const [isChecking, setIsChecking] = useState(true);
    const token = useAppSelector((state) => state.auth.token);

    const checkAuth = async () => {
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
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    dispatch(logout());
                    if (!isPublicPath) {
                        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
                    } else {
                        setIsChecking(false);
                    }
                    return;
                }
                
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ refreshToken })
                    });
                    
                    if (res.ok) {
                        const data = await res.json();
                        if (data.success && data.data.accessToken) {
                            const newToken = data.data.accessToken;
                            localStorage.setItem('token', newToken);
                            if (data.data.refreshToken) {
                                localStorage.setItem('refreshToken', data.data.refreshToken);
                            }
                            dispatch(setToken(newToken));
                            
                            if (isPublicPath) {
                                router.push('/dashboard');
                            } else {
                                setIsChecking(false);
                            }
                            return;
                        }
                    }
                    throw new Error('Refresh failed');
                } catch (e) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    dispatch(logout());
                    if (!isPublicPath) {
                        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
                    } else {
                        setIsChecking(false);
                    }
                    return;
                }
            }

            // Token is valid, sync to Redux if needed
            if (!token) {
                dispatch(setToken(storedToken));
                
                // Fetch user from token if not present
                const userFromToken = getUserFromToken(storedToken);
                if (userFromToken) {
                    dispatch(setUser(userFromToken));
                }
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
            localStorage.removeItem('refreshToken');
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
