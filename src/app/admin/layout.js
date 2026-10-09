import { headers } from 'next/headers';
import { isAdminAuthorized } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }) {
  if (!isAdminAuthorized(await headers())) return <p>Authentication required</p>;
  return children;
}
