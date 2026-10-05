import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from './lib/auth';

const protectedRoutes = ['/jobs', '/admin', '/onboarding', '/dashboard', '/employer'];
const publicOnlyRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Extract token from header (for mobile API) or cookie (for web)
  const authHeader = request.headers.get('Authorization');
  let token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
  
  if (!token) {
    token = request.cookies.get('session')?.value;
  }

  const session = token ? await decrypt(token) : null;

  // 1. Handle API Routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 2. Redirect authenticated users away from public-only routes
  if (publicOnlyRoutes.some(route => pathname.startsWith(route)) && session) {
    if (session.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/workers', request.url));
    } else if (session.role === 'EMPLOYER') {
      return NextResponse.redirect(new URL(`/employer`, request.url));
    } else {
      return NextResponse.redirect(new URL(`/dashboard`, request.url));
    }
  }

  // 3. Guard protected routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Role-based routing enforcement
  if (pathname.startsWith('/admin') && session?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL(session?.role === 'EMPLOYER' ? `/employer` : `/dashboard`, request.url));
  }

  if (pathname.startsWith('/jobs/admin')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
