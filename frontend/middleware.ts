// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Middleware membaca cookie yang kita set di login page tadi
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  // 1. Proteksi Halaman Admin
  if (path.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 2. Redirect User Login jika mencoba buka halaman login lagi
  if ((path === '/login' || path === '/register') && token) {
     if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
     }
     return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/register'],
};