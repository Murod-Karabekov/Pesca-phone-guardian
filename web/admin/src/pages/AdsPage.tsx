import { useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPatch, apiPost } from '../api';

type AdRow = {
  id: string;
  placement: string;
  title: string | null;
  imageUrl: string | null;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
};

const PLACEMENTS = [
  { value: 'HOME_MAIN', label: 'Bosh sahifa (Qanday ishlaydi o‘rnida)' },
  { value: 'NOTIFICATIONS_FOOTER', label: 'Xabarlar osti' },
] as const;

export default function AdsPage() {
  const [rows, setRows] = useState<AdRow[]>([]);
  const [filter, setFilter] = useState('');
  const [placement, setPlacement] = useState<'HOME_MAIN' | 'NOTIFICATIONS_FOOTER'>('HOME_MAIN');
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  function reload() {
    const q = filter ? `?placement=${encodeURIComponent(filter)}` : '';
    apiGet<AdRow[]>(`/api/admin/ads${q}`).then(setRows);
  }

  useEffect(() => {
    reload();
  }, [filter]);

  async function createAd() {
    await apiPost('/api/admin/ads', {
      placement,
      title: title.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      linkUrl: linkUrl.trim(),
      sortOrder,
      isActive: true,
    });
    setTitle('');
    setImageUrl('');
    setLinkUrl('');
    setSortOrder(0);
    reload();
  }

  async function toggleActive(row: AdRow) {
    await apiPatch(`/api/admin/ads/${row.id}`, { isActive: !row.isActive });
    reload();
  }

  async function remove(id: string) {
    if (!confirm('O‘chirilsinmi?')) return;
    await apiDelete(`/api/admin/ads/${id}`);
    reload();
  }

  return (
    <div>
      <h1>Reklamalar</h1>
      <p style={{ color: 'var(--muted)', maxWidth: 720 }}>
        Rasm uchun to‘liq <code>https://…</code> havola, video yoki YouTube uchun ochiladigan havolani «Ochish havolasi»ga
        yozing. Ilova faqat aktiv va joylashuv bo‘yicha ko‘rsatadi.
      </p>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Yangi reklama</h3>
        <label>Joy</label>
        <select className="input" value={placement} onChange={(e) => setPlacement(e.target.value as typeof placement)}>
          {PLACEMENTS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <div style={{ height: 8 }} />
        <input className="input" placeholder="Sarlavha (ixtiyoriy)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div style={{ height: 8 }} />
        <input
          className="input"
          placeholder="Rasm URL (ixtiyoriy), masalan https://…/banner.png"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <div style={{ height: 8 }} />
        <input
          className="input"
          placeholder="Ochish havolasi (majburiy): YouTube, video sahifa yoki boshqa"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
        />
        <div style={{ height: 8 }} />
        <label>Tartib (kichik raqam — yuqoriroq)</label>
        <input
          className="input"
          type="number"
          min={0}
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
        />
        <div style={{ height: 12 }} />
        <button className="btn" type="button" onClick={createAd} disabled={!linkUrl.trim()}>
          Qo‘shish
        </button>
      </div>

      <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <label>Filtr</label>
        <select className="input" style={{ maxWidth: 320 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Barchasi</option>
          {PLACEMENTS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Joy</th>
              <th>Sarlavha</th>
              <th>Havola</th>
              <th>Tartib</th>
              <th>Aktiv</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.placement}</td>
                <td>{r.title ?? '—'}</td>
                <td style={{ maxWidth: 220, wordBreak: 'break-all', fontSize: 12 }}>{r.linkUrl}</td>
                <td>{r.sortOrder}</td>
                <td>{r.isActive ? 'ha' : 'yo‘q'}</td>
                <td>
                  <button className="btn secondary" type="button" onClick={() => toggleActive(r)}>
                    {r.isActive ? 'To‘xtatish' : 'Yoqish'}
                  </button>{' '}
                  <button className="btn secondary" type="button" onClick={() => remove(r.id)}>
                    O‘chirish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
