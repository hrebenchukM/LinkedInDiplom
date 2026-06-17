import React, { useContext, useMemo } from 'react';
import { LogOut, Shield } from 'lucide-react';
import { Home, Users, Briefcase, MessageCircle, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppContext from '../../features/appContext/AppContext';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import { getProfileMediaVersion } from '../../features/profile/mapProfile.js';
import { getAccessToken } from '../../shared/api/tokens.js';
import { isAdminToken } from '../../shared/lib/jwtClaims.js';

import ThemeToggle from '../theme/ThemeToggle.jsx';
import LanguageSwitcher from '../i18n/LanguageSwitcher.jsx';
import { useTranslation, getDateLocale } from '../i18n/LocaleContext.jsx';
import HeaderSearch from './HeaderSearch.jsx';
import './Header.css';
import logoImg from '../../shared/assets/illustrations/linkedin_icon.png';


const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, locale } = useTranslation();
  const { user, profile, logout, account, token } = useContext(AppContext);

  const isAdmin = useMemo(() => {
    const accessToken = token || getAccessToken();
    return Boolean(
      user?.isAdmin ||
      account?.isAdmin ||
      (accessToken && isAdminToken(accessToken)),
    );
  }, [user, account, token]);

  const isActive = (path) => {
    if (path === '/app') {
      return location.pathname === '/app' || location.pathname === '/app/';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const profileTitle = useMemo(() => {
    if (!user) return '';
    let title = user.email ?? '';
    if (user.dob) {
      const b = new Date(user.dob);
      const now = new Date();
      let next = new Date(now.getFullYear(), b.getMonth(), b.getDate());
      if (next < now) next.setFullYear(next.getFullYear() + 1);
      const diff = Math.ceil((next - now) / (1000 * 60 * 60 * 24));
      const dateStr = b.toLocaleDateString(getDateLocale(locale));
      title += `\n${t('nav.birthdayLabel', 'Birthday: {date}', { date: dateStr })}`;
      title += `\n${t('nav.birthdayCountdown', '{n} days until birthday', { n: diff })}`;
    }
    return title;
  }, [user, t, locale]);

  const avatarVersion = getProfileMediaVersion(profile);

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">

            <div className="header-left">
              <div className="logo" onClick={() => navigate('/app')}>
                <img
                  src={logoImg}
                  width="40"
                  height="40"
                  alt={t('nav.logoAlt', 'LinkUp')}
                />
              </div>

              <HeaderSearch />
            </div>

            <nav className="header-nav">

              <button
                onClick={() => navigate('/app')}
                className={`nav-item ${isActive('/app') ? 'active' : ''}`}
              >
                <Home size={20} />
                <span>{t('nav.home', 'Home')}</span>
              </button>

                <button
                  onClick={() => navigate('/app/network')}
                  className={`nav-item ${isActive('/app/network') ? 'active' : ''}`}
                >
                  <Users size={20} />
                  <span>{t('nav.network', 'Network')}</span>
                </button>


                <button
                  onClick={() => navigate('/app/vacancies')}
                  className={`nav-item ${isActive('/app/vacancies') ? 'active' : ''}`}
                >
                <Briefcase size={20} />
                <span>{t('nav.vacancies', 'Vacancies')}</span>
              </button>

                <button
                  onClick={() => navigate('/app/messages')}
                  className={`nav-item ${isActive('/app/messages') ? 'active' : ''}`}
                >
                <MessageCircle size={20} />
                <span>{t('nav.messages', 'Messages')}</span>
              </button>

                <button
                  onClick={() => navigate('/app/notifications')}
                  className={`nav-item ${isActive('/app/notifications') ? 'active' : ''}`}
                >
                <Bell size={20} />
                <span>{t('nav.notifications', 'Notifications')}</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => navigate('/app/admin/dashboard')}
                  className={`nav-item ${location.pathname.startsWith('/app/admin') ? 'active' : ''}`}
                >
                  <Shield size={20} />
                  <span>{t('nav.admin', 'Admin')}</span>
                </button>
              )}

              <ThemeToggle variant="header" />
              <LanguageSwitcher variant="header" />

              {!user ? (
                <button
                  className="nav-item profile-item"
                  data-bs-toggle="modal"
                  data-bs-target="#authModal"
                >
                  {t('nav.login', 'Login')}
                </button>
                
              ) : (
                <>
                  <button
                    className={`nav-item profile-item ${location.pathname === '/app/profile' ? 'active' : ''}`}
                    title={profileTitle}
                    onClick={() => navigate('/app/profile')}
                  >
                <img
                  src={getAssetUrl(profile?.user?.avatarUrl, IMAGE_PLACEHOLDERS.avatar, avatarVersion)}
                  alt={t('nav.profile', 'My profile')}
                  className="nav-profile-img"
                />

                    <span>{t('nav.profile', 'My profile')}</span>
                  </button>
                        <button
                          onClick={logout}
                          className="nav-item logout-item"
                          title={t('nav.logout', 'Log out')}
                        >
                          <LogOut size={20} />
                          <span>{t('nav.logout', 'Log out')}</span>
                        </button>

                </>
              )}
            </nav>
          </div>
        </div>
      </header>

    </>
  );
};

export default Header;
