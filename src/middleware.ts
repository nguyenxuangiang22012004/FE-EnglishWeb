import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Decode JWT payload không cần thư viện (Edge Runtime compatible).
 * Chỉ decode phần payload (base64url), không verify signature.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // base64url → base64
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Kiểm tra token có hết hạn chưa
 */
function isTokenExpired(payload: Record<string, unknown>): boolean {
  const exp = payload['exp'];
  if (typeof exp !== 'number') return true;
  return Date.now() / 1000 > exp;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Chỉ áp dụng cho route /admin
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Đọc token từ cookie (authService.ts lưu vào cookie khi login)
  const token = request.cookies.get('token')?.value;

  if (!token) {
    // Chưa đăng nhập → redirect về login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = decodeJwtPayload(token);

  if (!payload || isTokenExpired(payload)) {
    // Token hết hạn hoặc không hợp lệ
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Kiểm tra role. Spring Security gán authority dạng "ROLE_ADMIN"
  // JWT của dự án này lưu role trong field "role" hoặc "authorities"
  const role = (payload['role'] as string | undefined)?.toUpperCase();
  const authorities = payload['authorities'] as string[] | undefined;

  const isAdmin =
    role === 'ADMIN' ||
    role === 'ROLE_ADMIN' ||
    (Array.isArray(authorities) &&
      authorities.some((a) => a === 'ADMIN' || a === 'ROLE_ADMIN'));

  if (!isAdmin) {
    // Đã đăng nhập nhưng không phải ADMIN → redirect về dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
