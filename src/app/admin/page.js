'use client';
import { useEffect, useState } from 'react';

const fields = [
  ['titleBefore', '首頁標題前半段'],
  ['titleAccent', '紅色強調文字'],
  ['titleAfter', '標題第二行'],
  ['description', '首頁介紹'],
  ['stickyTitle', '便利貼標題'],
  ['stickyDescription', '便利貼內容'],
];

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/home', { cache: 'no-store' })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || '讀取失敗');
        return result;
      })
      .then(setData)
      .catch(error => setStatus(error.message));
  }, []);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setStatus('正在發布至 GitHub…');
    try {
      const response = await fetch('/api/admin/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '儲存失敗');
      setData(previous => ({ ...previous, sha: result.sha }));
      setStatus(result.unchanged ? '內容沒有變更。' : '已提交 GitHub；Vercel 部署完成後首頁就會更新。');
    } catch (error) { setStatus(error.message); }
    finally { setSaving(false); }
  }

  return (
    <main className="container">
      <h1>Homepage Editor</h1>
      <p>登入後可編輯首頁文字，發布後更新 GitHub。</p>
      {!data ? <p role="status">{status || '載入中…'}</p> : (
        <form className="admin-form" onSubmit={save}>
          {fields.map(([key, label]) => (
            <label className="admin-field" key={key}>
              <strong>{label}</strong>
              <textarea required maxLength={5000} rows={key.includes('Description') || key === 'description' ? 4 : 2}
                value={data[key] || ''}
                onChange={e => setData(previous => ({ ...previous, [key]: e.target.value }))} />
            </label>
          ))}
          <button className="admin-save" type="submit" disabled={saving}>
            {saving ? '發布中…' : '發布修改'}
          </button>
          <p role="status">{status}</p>
        </form>
      )}
    </main>
  );
}
