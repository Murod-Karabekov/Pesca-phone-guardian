import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function ShellLayout() {
  const nav = useNavigate();
  return (
    <div className="layout">
      <aside className="sidebar">
        <div style={{ fontWeight: 800, marginBottom: 16 }}>Pesca Phone Guardian</div>
        <NavLink to="/" end>
          Dashboard
        </NavLink>
        <NavLink to="/users">Users</NavLink>
        <NavLink to="/devices">Devices</NavLink>
        <NavLink to="/reports">Scan reports</NavLink>
        <NavLink to="/ads">Reklamalar</NavLink>
        <button
          className="btn secondary"
          style={{ marginTop: 24, width: '100%' }}
          type="button"
          onClick={() => {
            localStorage.removeItem('ppg_token');
            nav('/login');
          }}
        >
          Log out
        </button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
