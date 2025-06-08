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
    // Skip middleware for login page
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }
    
    // For other admin routes, let the client-side auth handle it
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/_next/data/:path*',
    '/api/:path*'
  ],
} 