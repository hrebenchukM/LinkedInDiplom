import { useEffect, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppContext from '../../features/appContext/AppContext';
import { fileUrl } from '../../shared/api/files';

import {
  CheckCircle,
  MapPin,
  Link as LinkIcon,
  Users,
  Briefcase,
  Building2,
  Share2,
  Plus,
  MoreHorizontal
} from 'lucide-react';

import './CompanyPage.css';
import PostCard from '../../features/PostCard/PostCard';
import VacancyCard from '../../features/VacancyCard/VacancyCard';
import SimpleProfileCard from '../../features/SimpleProfileCard/SimpleProfileCard';
import MessagesPanel from '../../features/MessagesPanel/MessagesPanel';

const CompanyPage = ({ onNavigate }) => {

  const { id: companyId } = useParams();
  const { request } = useContext(AppContext);

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    request(`api://pages/${companyId}`)
      .then(res => {
        if (!cancelled) setCompany(res);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => (cancelled = true);
  }, [companyId]);

  if (loading) {
    return <main className="main-content">Loading...</main>;
  }

  if (!company) {
    return <main className="main-content">Company not found</main>;
  }

  // === ВАЖНО: распаковываем структуру ===
  const { page, followersCount, verified } = company;

  return (
    <main className="main-content">
      <div className="container">
        <div className="company-page">

          {/* ================= HEADER ================= */}
          <div className="company-header">
            <div className="company-cover">
              <img
                src={page.logoUrl ? fileUrl(page.logoUrl) : '/assets/event-cover.jpg'}
                alt={page.name}
              />
            </div>

            <div className="company-header-content">
              <div className="company-header-main">
                <img
                  src={page.logoUrl ? fileUrl(page.logoUrl) : '/assets/avatar-placeholder.png'}
                  alt={page.name}
                  className="company-logo"
                />

                <div className="company-info">
                  <div className="company-name-row">
                    <h1 className="company-name">{page.name}</h1>
                    {verified && (
                      <CheckCircle size={24} fill="#0ea5e9" color="white" />
                    )}
                  </div>

                  <div className="company-stats">
                    <span>{followersCount} followers</span>
                  </div>
                </div>
              </div>

              <div className="company-actions">
                <button
                  className={`btn-primary ${isFollowing ? 'following' : ''}`}
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  {isFollowing ? (
                    <>
                      <CheckCircle size={18} />
                      Following
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Follow
                    </>
                  )}
                </button>

                <button className="btn-secondary">
                  <Share2 size={18} />
                  Share
                </button>

                <button className="btn-secondary">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="company-content-grid">

            {/* ================= LEFT SIDEBAR ================= */}
            <aside className="company-sidebar">
              <div className="company-about-card">
                <h3>About</h3>
                <p>{page.description}</p>

                <div className="company-details">
                  <div className="detail-item">
                    <Building2 size={16} />
                    <span>Company page</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* ================= MAIN ================= */}
            <div className="company-main-content">
              <div className="company-tabs">
                <button
                  className={`company-tab ${activeTab === 'posts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('posts')}
                >
                  Posts
                </button>
                <button
                  className={`company-tab ${activeTab === 'jobs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('jobs')}
                >
                  Jobs
                </button>
                <button
                  className={`company-tab ${activeTab === 'team' ? 'active' : ''}`}
                  onClick={() => setActiveTab('team')}
                >
                  Team
                </button>
                <button
                  className={`company-tab ${activeTab === 'about' ? 'active' : ''}`}
                  onClick={() => setActiveTab('about')}
                >
                  About
                </button>
              </div>

              {activeTab === 'posts' && (
                <div className="company-posts">
                  <p>No posts yet</p>
                </div>
              )}

              {activeTab === 'jobs' && (
                <div className="company-jobs">
                  <p>No jobs yet</p>
                </div>
              )}

              {activeTab === 'team' && (
                <div className="company-team">
                  <p>Team data coming soon</p>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="company-about-full">
                  <div className="about-section">
                    <h2>Overview</h2>
                    <p>{page.description}</p>
                  </div>

                  <div className="about-section">
                    <h2>Company Information</h2>
                    <div className="info-grid">
                      <div className="info-card">
                        <Users size={24} />
                        <div>
                          <span className="info-label">Followers</span>
                          <span className="info-value">{followersCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ================= RIGHT SIDEBAR ================= */}
            <aside className="company-sidebar-right">
              <SimpleProfileCard />
              <MessagesPanel onNavigate={onNavigate} />
            </aside>

          </div>
        </div>
      </div>
    </main>
  );
};

export default CompanyPage;
