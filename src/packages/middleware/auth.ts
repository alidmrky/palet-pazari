import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Auth middleware - Kullanıcı giriş kontrolü
 */
export async function authMiddleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  const { pathname } = request.nextUrl;

  // Public routes - giriş gerektirmeyen sayfalar
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/api/auth',
    '/api/mongodb/test'
  ];

  // Auth routes - sadece giriş yapmamış kullanıcılar için
  const authRoutes = [
    '/auth/login',
    '/auth/register'
  ];

  // Protected routes - giriş gerektiren sayfalar
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    '/admin'
  ];

  // Public route kontrolü
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // Auth routes için giriş yapmış kullanıcıları yönlendir
    if (authRoutes.some(route => pathname.startsWith(route)) && token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes için giriş kontrolü
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

/**
 * Admin middleware - Admin yetkisi kontrolü
 */
export async function adminMiddleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  const { pathname } = request.nextUrl;

  // Admin routes
  const adminRoutes = ['/admin'];

  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Admin yetkisi kontrolü (bu kısım User modeline admin field eklenerek genişletilebilir)
    if (token.userType !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

/**
 * API route koruması
 */
export async function apiAuthMiddleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  const { pathname } = request.nextUrl;

  // Protected API routes
  const protectedApiRoutes = [
    '/api/user',
    '/api/dashboard',
    '/api/admin'
  ];

  if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}
