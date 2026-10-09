import { NextResponse } from 'next/server';
import home from '../../../../../public/home.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FIELDS = ['titleBefore','titleAccent','titleAfter','description','stickyTitle','stickyDescription'];
const FILE = 'public/home.json';
const URL = 'https://api.github.com/repos/benjamin-shih-tw/portfolio-blog/contents/' + FILE;

export async function GET() {
  return NextResponse.json(home, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: '無效的請求來源' }, { status: 403 });
  }
  const token = process.env.GITHUB_TOKEN;
  if (!token) return NextResponse.json({ error: '請先在 Vercel 設定 GITHUB_TOKEN' }, { status: 503 });
  let data;
  try { data = await request.json(); }
  catch { return NextResponse.json({ error: 'JSON 格式錯誤' }, { status: 400 }); }
  if (!data || typeof data !== 'object' || Array.isArray(data) ||
      !FIELDS.every(key => typeof data[key] === 'string' && data[key].length > 0 && data[key].length <= 5000)) {
    return NextResponse.json({ error: '欄位內容格式錯誤' }, { status: 400 });
  }
  const clean = Object.fromEntries(FIELDS.map(key => [key, data[key]]));
  const headers = {
    Authorization: 'Bearer ' + token,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  try {
    const existing = await fetch(URL + '?ref=main', { headers, cache: 'no-store' });
    if (!existing.ok) throw new Error('無法取得 GitHub 目前版本');
    const { sha } = await existing.json();
    const result = await fetch(URL, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Update homepage from protected admin',
        branch: 'main', sha,
        content: Buffer.from(JSON.stringify(clean, null, 2) + '\n').toString('base64'),
      }),
    });
    if (!result.ok) throw new Error('GitHub 發布失敗 (HTTP ' + result.status + ')');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin publish error:', error);
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}
