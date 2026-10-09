import { NextResponse } from 'next/server';
import { isAdminAuthorized, unauthorizedResponse, adminHeaders } from './lib/admin-auth';

export function proxy(request) {
  if (!isAdminAuthorized(request.headers)) return unauthorizedResponse();
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(adminHeaders)) response.headers.set(key, value);
  return response;
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
