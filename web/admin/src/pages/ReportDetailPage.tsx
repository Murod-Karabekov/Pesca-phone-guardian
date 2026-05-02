import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet, apiPatch, apiPost } from '../api';

type AppRow = {
  id: string;
  packageName: string;
  appName?: string;
  riskScore: number;
  riskLevel: string;
  riskReasons: string[];
};

type Report = {
  id: string;
  status: string;
  overallRiskScore: number;
  analystNote?: string | null;
  user: { id: string; phoneNumber: string };
  device: Record<string, unknown>;
  installedApps: AppRow[];
};

function lvlClass(l: string) {
  return `badge ${l.toLowerCase()}`;
}

export default function ReportDetailPage() {
  const { id } = useParams();
  const [rep, setRep] = useState<Report | null>(null);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [modalApp, setModalApp] = useState<AppRow | null>(null);
  const [verdict, setVerdict] = useState('SUSPICIOUS');
  const [rec, setRec] = useState('');

  async function reload() {
    if (!id) return;
    const r = await apiGet<Report>(`/api/admin/reports/${id}`);
    setRep(r);
    setStatus(r.status);
    setNote((r.analystNote as string) || '');
  }

  useEffect(() => {
    reload().catch(() => setRep(null));
  }, [id]);

  if (!rep) return <div className="card">Loading or not found…</div>;

  async function saveStatus() {
    await apiPatch(`/api/admin/reports/${rep.id}/status`, { status, analystNote: note || undefined });
    await reload();
  }

  async function submitReview() {
    if (!modalApp) return;
    await apiPost(`/api/admin/reports/${rep.id}/review-app`, {
      installedAppId: modalApp.id,
      verdict,
      recommendation: rec || undefined,
    });
    setModalApp(null);
    await reload();
  }

  return (
    <div>
      <h1>Report {rep.id.slice(0, 8)}…</h1>
      <div className="card">
        <p>
          <strong>User:</strong> {rep.user.phoneNumber}
        </p>
        <p>
          <strong>Overall score:</strong> {rep.overallRiskScore}
        </p>
        <label>Status</label>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          {['NEW', 'REVIEWING', 'SAFE', 'DANGEROUS', 'CLOSED'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div style={{ height: 8 }} />
        <label>Analyst note</label>
        <textarea className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        <div style={{ height: 12 }} />
        <button className="btn" type="button" onClick={saveStatus}>
          Save status
        </button>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <h3>Installed apps</h3>
        <table>
          <thead>
            <tr>
              <th>App</th>
              <th>Package</th>
              <th>Score</th>
              <th>Level</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rep.installedApps.map((a) => (
              <tr key={a.id}>
                <td>{a.appName || '—'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{a.packageName}</td>
                <td>{a.riskScore}</td>
                <td>
                  <span className={lvlClass(a.riskLevel)}>{a.riskLevel}</span>
                </td>
                <td>
                  <button className="btn secondary" type="button" onClick={() => setModalApp(a)}>
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div className="card" style={{ maxWidth: 520, width: '100%' }}>
            <h3>{modalApp.appName || modalApp.packageName}</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>
              {Array.isArray(modalApp.riskReasons)
                ? modalApp.riskReasons.join(' · ')
                : String(modalApp.riskReasons ?? '')}
            </p>
            <label>Verdict</label>
            <select className="input" value={verdict} onChange={(e) => setVerdict(e.target.value)}>
              <option value="SAFE">SAFE</option>
              <option value="SUSPICIOUS">SUSPICIOUS</option>
              <option value="DANGEROUS">DANGEROUS</option>
            </select>
            <div style={{ height: 8 }} />
            <label>Recommendation</label>
            <textarea className="input" rows={3} value={rec} onChange={(e) => setRec(e.target.value)} />
            <div style={{ height: 12, display: 'flex', gap: 8 }}>
              <button className="btn" type="button" onClick={submitReview}>
                Submit review
              </button>
              <button className="btn secondary" type="button" onClick={() => setModalApp(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
