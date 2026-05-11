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
        
        // Map JWT payload fields to User interface
        // Depending on your backend implementation, 'sub' or 'email' might be used for the unique identifier
        // and 'name' or 'fullName' for the display name.
        return {
            id: decoded.id || decoded.sub || '',
            email: decoded.email || decoded.sub || '',
            name: decoded.name || 'User',
            role: (decoded.role as any) || 'user',
        };
    } catch (error) {
        console.error('Failed to decode JWT token:', error);
        return null;
    }
};
