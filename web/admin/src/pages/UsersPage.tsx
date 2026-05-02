import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../api';

type Row = {
  id: string;
  phoneNumber: string;
  createdAt: string;
  _count: { devices: number; scanReports: number };
};

export default function UsersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams({ page: '1', limit: '50' });
    if (search) q.set('search', search);
    apiGet<{ items: Row[] }>(`/api/admin/users?${q}`)
      .then((r) => setRows(r.items))
      .catch(() => setErr('Failed to load users'));
  }, [search]);

  if (err) return <div className="card">{err}</div>;

  return (
    <div>
      <h1>Users</h1>
      <div className="card">
        <input
          className="input"
          placeholder="Search phone number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Phone</th>
              <th>Devices</th>
              <th>Reports</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td>{u.phoneNumber}</td>
                <td>{u._count.devices}</td>
                <td>{u._count.scanReports}</td>
                <td>
                  <Link to={`/users/${u.id}`}>Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
