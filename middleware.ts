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
    pathname.startsWith('/_next/data/') ||
    pathname.startsWith('/images/')
  ) {
    return NextResponse.next()
  }

  // Handle admin routes
  if (pathname.startsWith('/admin')) {
    // Skip middleware for login page and API routes
    if (pathname === '/admin/login' || pathname.startsWith('/admin/api/')) {
      return NextResponse.next()
    }
    
    // Check for token in cookies and localStorage
    const token = req.cookies.get('token')
    const authHeader = req.headers.get('authorization')
    
    // If no token in cookie or header, redirect to login
    if (!token && !authHeader?.startsWith('Bearer ')) {
      const url = new URL('/admin/login', req.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    '/admin/:path*'
  ],
} 