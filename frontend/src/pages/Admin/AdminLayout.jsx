import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './admin.css';

const NAV_ITEMS = [
  { to: '/app/admin/dashboard', label: 'Dashboard' },
  { to: '/app/admin/users', label: 'Users' },
  { to: '/app/admin/roles', label: 'Roles' },
  { to: '/app/admin/content', label: 'Content' },
  { to: '/app/admin/comments', label: 'Comments' },
  { to: '/app/admin/jobs', label: 'Jobs' },
  { to: '/app/admin/events', label: 'Events' },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="container admin-shell">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          className="admin-back-btn"
          onClick={() => navigate('/app')}
        >
          Back to app
        </button>
      </aside>

      <section className="admin-main">
        <Outlet />
      </section>
    </div>
  );
}
