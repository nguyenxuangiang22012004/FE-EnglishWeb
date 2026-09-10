import { jwtDecode } from 'jwt-decode';
import { User } from '@/types/auth';

export interface JwtPayload {
    sub?: string;
    email?: string;
    name?: string;
    role?: string;
    id?: string;
    exp?: number;
    iat?: number;
}

/**
 * Extract user information from JWT token
 * @param token JWT access token
 * @returns User object or null if invalid
 */
export const getUserFromToken = (token: string): User | null => {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        
        // Map role từ JWT (ADMIN/USER/TEACHER) → lowercase để khớp User type ('admin'|'user'|'teacher')
        const rawRole = (decoded.role || 'user').toLowerCase() as 'user' | 'admin' | 'teacher';
        
        return {
            id: decoded.id || decoded.sub || '',
            email: decoded.email || decoded.sub || '',
            name: decoded.name || 'User',
            role: rawRole,
        };
    } catch (error) {
        console.error('Failed to decode JWT token:', error);
        return null;
    }
};
