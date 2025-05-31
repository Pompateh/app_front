import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // let HMR, assets, login & auth calls through
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname === '/favicon.ico' ||
    pathname === '/login' ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next()
  }

  // protect /admin/*
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('token')
    if (!token) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/admin/login'
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
} 