import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { apiGet } from '../api';

type Dash = {
  totals: {
    users: number;
    devices: number;
    reports: number;
    riskyApps: number;
    criticalApps: number;
  };
};

export default function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Dash>('/api/admin/dashboard')
      .then(setData)
      .catch(() => setErr('Failed to load dashboard'));
  }, []);

  if (err) return <div className="card">{err}</div>;
  if (!data) return <div className="card">Loading…</div>;

  const chart = [
    { name: 'Users', v: data.totals.users },
    { name: 'Devices', v: data.totals.devices },
    { name: 'Reports', v: data.totals.reports },
    { name: 'Risky apps', v: data.totals.riskyApps },
    { name: 'Critical', v: data.totals.criticalApps },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="grid">
        {Object.entries(data.totals).map(([k, v]) => (
          <div key={k} className="card">
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>{k}</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{v}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chart}>
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Bar dataKey="v" fill="#22d3ee" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
