import { createHash, timingSafeEqual } from 'node:crypto';

export function isAdminAuthorized(headers) {
  const password = process.env.ADMIN_PASSWORD;
  const header = headers.get('authorization') || '';
  if (!password || !/^Basic /i.test(header) || header.length > 16384) return false;
  try {
    const value = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const separator = value.indexOf(':');
    if (separator < 0) return false;
    const digest = text => createHash('sha256').update(text).digest();
    return timingSafeEqual(digest(value.slice(0, separator)), digest('admin')) &&
      timingSafeEqual(digest(value.slice(separator + 1)), digest(password));
  } catch { return false; }
}

export const adminHeaders = {
  'Cache-Control': 'private, no-store',
  'Vary': 'Authorization',
  'X-Robots-Tag': 'noindex, nofollow',
};

export function unauthorizedResponse() {
  return new Response('Authentication required', {
    status: 401,
    headers: { ...adminHeaders, 'WWW-Authenticate': 'Basic realm="Portfolio Admin", charset="UTF-8"' },
  });
}
