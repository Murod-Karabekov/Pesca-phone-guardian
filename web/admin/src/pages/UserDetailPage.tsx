import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet, apiPost } from '../api';

export default function UserDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('WARNING');

  useEffect(() => {
    if (!id) return;
    apiGet(`/api/admin/users/${id}`).then(setData);
  }, [id]);

  if (!data) return <div className="card">Loading…</div>;

  const user = data as {
    id: string;
    phoneNumber: string;
    devices: unknown[];
    scanReports: unknown[];
  };

  async function sendNotify() {
    await apiPost(`/api/admin/users/${user.id}/notify`, {
      title,
      message,
      type,
    });
    alert('Notification sent');
  }

  return (
    <div>
      <h1>User {user.phoneNumber}</h1>
      <div className="card">
        <h3>Send in-app notification</h3>
        <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div style={{ height: 8 }} />
        <textarea
          className="input"
          rows={3}
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div style={{ height: 8 }} />
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="INFO">INFO</option>
          <option value="WARNING">WARNING</option>
          <option value="DANGER">DANGER</option>
        </select>
        <div style={{ height: 12 }} />
        <button className="btn" type="button" onClick={sendNotify}>
          Send
        </button>
      </div>
      <div className="card">
        <h3>Devices ({user.devices?.length ?? 0})</h3>
        <pre style={{ whiteSpace: 'pre-wrap', color: 'var(--muted)', fontSize: 12 }}>
          {JSON.stringify(user.devices, null, 2)}
        </pre>
      </div>
    </div>
  );
}
