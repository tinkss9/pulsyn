// Pulsyn Dashboard Middleware
// Protects dashboard routes with authentication

import { NextRequest, NextResponse } from 'next/server';

// Public routes that don't require auth
const PUBLIC_ROUTES = [
  '/',
  '/pricing',
  '/login',
  '/signup',
  '/demo',
  '/marketplace',
  '/mcp/templates',
  '/api/auth',
  '/api/webhooks',
  '/api/health',
  '/api/marketplace',
  '/api/mcp/templates',
  '/api/billing/status',
  '/api/lab',
  '/api/custom-replication',
  '/api/ai',
  '/vs',
  '/use-cases',
  '/contact',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for API key in header (x-api-key or Authorization: Bearer) or cookie
  const authHeader = req.headers.get('authorization');
  const bearerKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const apiKey = req.headers.get('x-api-key') || bearerKey || req.cookies.get('pulsyn_token')?.value;

  // For dashboard routes, check for session
  if (pathname.startsWith('/dashboard')) {
    if (!apiKey) {
      // Redirect to login
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // For API routes, check for API key
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required. Pass via x-api-key header.' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
  ],
};
