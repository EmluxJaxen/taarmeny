import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { hashPassword } from '@/lib/crypto';

export async function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('admin_session');
  const adminPassword = process.env.ADMIN_PASSWORD;

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', request.nextUrl.pathname);

  if (!authCookie?.value || !adminPassword) {
    return NextResponse.redirect(loginUrl);
  }

  // Validate the cookie against the hashed environment variable
  const expectedHash = await hashPassword(adminPassword);

  if (authCookie.value !== expectedHash) {
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
