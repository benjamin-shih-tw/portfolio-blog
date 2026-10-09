import { NextResponse } from 'next/server';
import { isAdminAuthorized, unauthorizedResponse, adminHeaders } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FIELDS = ['titleBefore', 'titleAccent', 'titleAfter', 'description', 'stickyTitle', 'stickyDescription'];
const CONTENTS_URL = 'https://api.github.com/repos/benjamin-shih-tw/portfolio-blog/contents/public/home.json';

function json(data, status = 200) {
  return NextResponse.json(data, { status, headers: adminHeaders });
}

function valid(data) {
  return data && typeof data === 'object' && !Array.isArray(data) &&
    FIELDS.every(key => typeof data[key] === 'string' && data[key].trim().length > 0 && data[key].length <= 5000);
}

function githubHeaders() {
  return {
    Authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function currentHome() {
  const response = await fetch(CONTENTS_URL + '?ref=main', {
    headers: githubHeaders(), cache: 'no-store', signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('GitHub read failed');
  const file = await response.json();
  const data = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
  if (!valid(data) || typeof file.sha !== 'string') throw new Error('Invalid GitHub content');
  return { data: Object.fromEntries(FIELDS.map(key => [key, data[key]])), sha: file.sha };
}

export async function GET(request) {
  if (!isAdminAuthorized(request.headers)) return unauthorizedResponse();
  if (!process.env.GITHUB_TOKEN) return json({ error: '請在 Vercel 安全介面設定 GITHUB_TOKEN 後重新部署' }, 503);
  try {
    const { data, sha } = await currentHome();
    return json({ ...data, sha });
  } catch {
    return json({ error: '無法讀取 GitHub 最新內容，請檢查 Token 的儲存庫讀取權限' }, 502);
  }
}

export async function PUT(request) {
  if (!isAdminAuthorized(request.headers)) return unauthorizedResponse();
  if (request.headers.get('origin') !== new URL(request.url).origin ||
      request.headers.get('sec-fetch-site') === 'cross-site') {
    return json({ error: '無效的請求來源' }, 403);
  }
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
    return json({ error: '必須使用 JSON 格式' }, 415);
  }
  if (!process.env.GITHUB_TOKEN) return json({ error: '請在 Vercel 安全介面設定 GITHUB_TOKEN 後重新部署' }, 503);
  let data;
  try {
    const text = await request.text();
    if (Buffer.byteLength(text, 'utf8') > 200000) return json({ error: '內容過大' }, 413);
    data = JSON.parse(text);
  } catch { return json({ error: 'JSON 格式錯誤' }, 400); }
  if (!valid(data) || typeof data.sha !== 'string' || !/^[a-f0-9]{40}$/.test(data.sha)) {
    return json({ error: '欄位內容或版本格式錯誤，請重新載入' }, 400);
  }
  const clean = Object.fromEntries(FIELDS.map(key => [key, data[key]]));
  try {
    const current = await currentHome();
    if (current.sha !== data.sha) return json({ error: '內容已被修改，請重新載入後再編輯' }, 409);
    if (JSON.stringify(clean) === JSON.stringify(current.data)) return json({ success: true, unchanged: true, sha: current.sha });
    const response = await fetch(CONTENTS_URL, {
      method: 'PUT',
      headers: { ...githubHeaders(), 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        message: 'Update homepage from protected admin',
        branch: 'main', sha: data.sha,
        content: Buffer.from(JSON.stringify(clean, null, 2) + '\n').toString('base64'),
      }),
    });
    if (response.status === 409 || response.status === 422) return json({ error: '發布衝突，請重新載入後再試' }, 409);
    if (!response.ok) return json({ error: 'GitHub 發布失敗，請檢查 Token 的 Contents 寫入權限' }, 502);
    const result = await response.json();
    return json({ success: true, sha: result.content.sha, commitUrl: result.commit.html_url });
  } catch {
    return json({ error: 'GitHub 請求失敗或逾時；請重新載入確認是否已發布' }, 502);
  }
}
