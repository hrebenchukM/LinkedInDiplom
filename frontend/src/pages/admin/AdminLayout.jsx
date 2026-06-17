import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Shield,
  Users,
} from 'lucide-react';
import './admin.css';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const NAV_ITEMS = [
  { to: '/app/admin/dashboard', labelKey: 'admin.nav.dashboard', fallback: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/admin/users', labelKey: 'admin.nav.users', fallback: 'Users', icon: Users },
  { to: '/app/admin/roles', labelKey: 'admin.nav.roles', fallback: 'Roles', icon: Shield },
  { to: '/app/admin/content', labelKey: 'admin.nav.content', fallback: 'Content', icon: FileText },
  { to: '/app/admin/comments', labelKey: 'admin.nav.comments', fallback: 'Comments', icon: MessageSquare },
  { to: '/app/admin/jobs', labelKey: 'admin.nav.jobs', fallback: 'Jobs', icon: Briefcase },
  { to: '/app/admin/events', labelKey: 'admin.nav.events', fallback: 'Events', icon: Calendar },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="container admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-head">
          <Shield size={20} className="admin-sidebar-icon" />
          <h2>{t('admin.panel.title', 'Admin Panel')}</h2>
        </div>
        <nav className="admin-nav" aria-label={t('admin.nav.label', 'Admin navigation')}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <Icon size={16} />
                {t(item.labelKey, item.fallback)}
              </NavLink>
            );
          })}
        </nav>
        <button
          type="button"
          className="admin-back-btn"
          onClick={() => navigate('/app')}
        >
          <ArrowLeft size={16} />
          {t('admin.backToApp', 'Back to app')}
        </button>
      </aside>

      <section className="admin-main">
        <Outlet />
      </section>
    </div>
  );
}
