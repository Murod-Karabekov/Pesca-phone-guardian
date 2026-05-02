import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../api';

type Row = {
  id: string;
  status: string;
  overallRiskScore: number;
  createdAt: string;
  user: { phoneNumber: string };
};

export default function ReportsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const q = new URLSearchParams({ page: '1', limit: '50' });
    if (status) q.set('status', status);
    apiGet<{ items: Row[] }>(`/api/admin/reports?${q}`).then((r) => setRows(r.items));
  }, [status]);

  return (
    <div>
      <h1>Scan reports</h1>
      <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <label>Status</label>
        <select className="input" style={{ maxWidth: 220 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="NEW">NEW</option>
          <option value="REVIEWING">REVIEWING</option>
          <option value="SAFE">SAFE</option>
          <option value="DANGEROUS">DANGEROUS</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Score</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.user.phoneNumber}</td>
                <td>{r.overallRiskScore}</td>
                <td>{r.status}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>
                  <Link to={`/reports/${r.id}`}>Detail</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
