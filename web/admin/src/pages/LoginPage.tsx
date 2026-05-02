import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../api';

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@pesca.local');
  const [password, setPassword] = useState('ChangeMe123!');
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const res = await apiPost<{ accessToken: string }>('/api/admin/login', {
        email,
        password,
      });
      localStorage.setItem('ppg_token', res.accessToken);
      nav('/');
    } catch {
      setErr('Login failed');
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24 }} className="card">
      <h1 style={{ marginTop: 0 }}>Admin login</h1>
      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div style={{ height: 12 }} />
        <label>Password</label>
        <input
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {err && <p style={{ color: 'var(--danger)' }}>{err}</p>}
        <div style={{ height: 16 }} />
        <button className="btn" type="submit">
          Sign in
        </button>
      </form>
    </div>
  );
}
