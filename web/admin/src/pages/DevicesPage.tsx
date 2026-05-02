import { useEffect, useState } from 'react';
import { apiGet } from '../api';

type Row = {
  id: string;
  brand?: string;
  model?: string;
  manufacturer?: string;
  androidVersion?: string;
  user: { phoneNumber: string };
};

export default function DevicesPage() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    apiGet<{ items: Row[] }>('/api/admin/devices?page=1&limit=100').then((r) => setRows(r.items));
  }, []);

  return (
    <div>
      <h1>Devices</h1>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Android</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id}>
                <td>{d.user.phoneNumber}</td>
                <td>{d.brand}</td>
                <td>{d.model}</td>
                <td>{d.androidVersion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
