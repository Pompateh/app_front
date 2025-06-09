import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow all static files, assets, and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/api/') ||
    pathname.includes('.json') ||
    pathname.startsWith('/_next/data/')
  ) {
    return NextResponse.next()
  }

  // Handle admin routes
  if (pathname.startsWith('/admin')) {
    // Skip middleware for login page and API routes
    if (pathname === '/admin/login' || pathname.startsWith('/admin/api/')) {
      return NextResponse.next()
    }
    
    // Check for token in cookies
    const token = req.cookies.get('token')
    
    // If no token, redirect to login
    if (!token) {
      const url = new URL('/admin/login', req.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 