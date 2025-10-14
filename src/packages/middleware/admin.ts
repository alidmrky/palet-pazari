import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Admin middleware - sadece admin kullanıcılar erişebilir
 */
export async function adminMiddleware(request: NextRequest) {
  // Sadece admin route'larını kontrol et
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return null;
  }

  // Geçici olarak admin middleware devre dışı
  return null;

  // try {
  //   const token = await getToken({
  //     req: request,
  //     secret: process.env.NEXTAUTH_SECRET
  //   });

  //   // Token kontrolü
  //   if (!token) {
  //     return NextResponse.redirect(new URL('/auth/login', request.url));
  //   }

  //   // Admin kontrolü
  //   if (token.userType !== 'admin') {
  //     return NextResponse.redirect(new URL('/', request.url));
  //   }

  //   return null; // Devam et
  // } catch (error) {
  //   console.error('Admin middleware hatası:', error);
  //   return NextResponse.redirect(new URL('/auth/login', request.url));
  // }
}

/**
 * Admin route kontrolü
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

/**
 * Admin yetki kontrolü
 */
export function hasAdminAccess(userType: string): boolean {
  return userType === 'admin';
}
