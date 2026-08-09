// Pulsyn Dashboard Middleware
// Protects dashboard routes with authentication + security headers

import { NextRequest, NextResponse } from 'next/server';

// Public routes that don't require auth
const PUBLIC_ROUTES = [
  '/',
  '/pricing',
  '/login',
  '/signup',
  '/demo',
  '/marketplace',
  '/competition',
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
  '/api/competition',
  '/vs',
  '/use-cases',
  '/contact',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Clickjacking protection
  response.headers.set('X-Frame-Options', 'DENY');
  
  // MIME sniffing prevention
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy — restrict sensitive features
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy (basic — tighten as needed)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.stripe.com;"
  );
  
  // Strict Transport Security (HTTPS only) — 1 year
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  
  return response;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes (with security headers)
  if (isPublicRoute(pathname)) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
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
      const response = NextResponse.redirect(loginUrl);
      return addSecurityHeaders(response);
    }
  }

  // For API routes, check for API key
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    if (!apiKey) {
      const response = NextResponse.json(
        { error: 'API key required. Pass via x-api-key header.' },
        { status: 401 }
      );
      return addSecurityHeaders(response);
    }
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
  ],
};
