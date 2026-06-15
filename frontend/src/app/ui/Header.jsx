import React, { useContext, useMemo } from 'react';
import { LogOut, Shield } from 'lucide-react';
import { Home, Users, Briefcase, MessageCircle, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppContext from '../../features/appContext/AppContext';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import { getAccessToken } from '../../shared/api/tokens.js';
import { isAdminToken } from '../../shared/lib/jwtClaims.js';

import './Header.css';
import logoImg from '../../shared/assets/illustrations/linkedin_icon.png';


const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
const { user, profile, logout, account, token } = useContext(AppContext);

  const isAdmin = useMemo(() => {
    const accessToken = token || getAccessToken();
    return Boolean(
      user?.isAdmin ||
      account?.isAdmin ||
      (accessToken && isAdminToken(accessToken)),
    );
  }, [user, account, token]);

  const isActive = (path) => location.pathname === path;

  const profileTitle = useMemo(() => {
    if (!user) return '';
    let t = user.email ?? '';
    if (user.dob) {
      const b = new Date(user.dob);
      const now = new Date();
      let next = new Date(now.getFullYear(), b.getMonth(), b.getDate());
      if (next < now) next.setFullYear(next.getFullYear() + 1);
      const diff = Math.ceil((next - now) / (1000 * 60 * 60 * 24));
      t += `\nДата народження: ${b.toLocaleDateString()}`;
      t += `\nДо дня народження: ${diff} днів`;
    }
    return t;
  }, [user]);

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">

            <div className="header-left">
              <div className="logo" onClick={() => navigate('/')}>
                         <img
                           src={logoImg} width="64" height="64"
                           alt="LinkedIn Analogue"
                           className="landing-logo-img"
                         />
              </div>

              <div className="search-box">
                <input type="text" placeholder="Search" className="search-input" />
              </div>
            </div>

            <nav className="header-nav">

              <button
                onClick={() => navigate('/app')}
                className={`nav-item ${isActive('/app') ? 'active' : ''}`}
              >
                <Home size={20} />
                <span>Home</span>
              </button>

                <button
                  onClick={() => navigate('/app/network')}
                  className={`nav-item ${isActive('/app/network') ? 'active' : ''}`}
                >
                  <Users size={20} />
                  <span>Network</span>
                </button>


                <button
                  onClick={() => navigate('/app/vacancies')}
                  className={`nav-item ${isActive('/app/vacancies') ? 'active' : ''}`}
                >
                <Briefcase size={20} />
                <span>Vacancies</span>
              </button>

                <button
                  onClick={() => navigate('/app/messages')}
                  className={`nav-item ${isActive('/app/messages') ? 'active' : ''}`}
                >
                <MessageCircle size={20} />
                <span>Messages</span>
              </button>

                <button
                  onClick={() => navigate('/app/notifications')}
                  className={`nav-item ${isActive('/app/notifications') ? 'active' : ''}`}
                >
                <Bell size={20} />
                <span>Notifications</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => navigate('/app/admin')}
                  className={`nav-item ${location.pathname.startsWith('/app/admin') ? 'active' : ''}`}
                >
                  <Shield size={20} />
                  <span>Admin</span>
                </button>
              )}

              {!user ? (
                <button
                  className="nav-item profile-item"
                  data-bs-toggle="modal"
                  data-bs-target="#authModal"
                >
                  Login
                </button>
                
              ) : (
                <>
                  <button
                    className={`nav-item profile-item ${isActive('/profile') ? 'active' : ''}`}
                    title={profileTitle}
                    onClick={() => navigate('/app/profile')}
                  >
                <img
                  src={getAssetUrl(profile?.user?.avatarUrl, IMAGE_PLACEHOLDERS.avatar)}
                  alt="Profile"
                  className="nav-profile-img"
                />

                    <span>My profile</span>
                  </button>
                        <button
                          onClick={logout}
                          className="nav-item logout-item"
                          title="Log out"
                        >
                          <LogOut size={20} />
                          <span>Log out</span>
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
