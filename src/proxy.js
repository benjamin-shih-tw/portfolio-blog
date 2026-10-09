import { NextResponse } from 'next/server';

function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  let diff = a.length ^ b.length;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export function proxy(request) {
  const password = process.env.ADMIN_PASSWORD;
  const header = request.headers.get('authorization') || '';
  let authorized = false;
  if (password && header.startsWith('Basic ')) {
    try {
      const value = atob(header.slice(6));
      const separator = value.indexOf(':');
      authorized = separator !== -1 &&
        constantTimeEqual(value.slice(0, separator), 'admin') &&
        constantTimeEqual(value.slice(separator + 1), password);
    } catch { authorized = false; }
  }
  if (authorized) return NextResponse.next();
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Portfolio Admin", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  });
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
