import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from './lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Append current pathname in request headers so RootLayout can read it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  const token = request.cookies.get('session')?.value;
  const session = token ? await decrypt(token) : null;
  const isAdmin = session && session.role === 'ADMIN';

  // 1. If user is on /login:
  if (pathname.startsWith('/login')) {
    // If already authenticated as ADMIN, redirect to dashboard
    if (isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 2. Guard all other admin routes: must have active ADMIN session
  if (!isAdmin) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
