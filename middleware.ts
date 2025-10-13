import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, adminMiddleware, apiAuthMiddleware } from '@/packages/middleware/auth';

export async function middleware(request: NextRequest) {
  // Auth middleware
  const authResponse = await authMiddleware(request);
  if (authResponse) return authResponse;

  // Admin middleware
  const adminResponse = await adminMiddleware(request);
  if (adminResponse) return adminResponse;

  // API auth middleware
  const apiResponse = await apiAuthMiddleware(request);
  if (apiResponse) return apiResponse;

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
