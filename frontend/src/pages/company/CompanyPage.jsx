import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import {
  followPage,
  getMyFollowedPages,
  getPageById,
  getPageFollowers,
  unfollowPage,
} from '../../features/network/networkApi.js';
import { getUserPosts } from '../../features/content/contentApi.js';
import { getVacancies } from '../../features/jobs/jobsApi.js';
import { enrichUsersWithProfiles } from '../../features/network/enrichNetworkProfiles.js';
import { getErrorMessage } from '../../shared/lib/apiError.js';

import {
  CheckCircle,
  Users,
  Building2,
  Share2,
  Plus,
  MoreHorizontal,
} from 'lucide-react';

import './CompanyPage.css';
import PostCard from '../../features/PostCard/PostCard';
import VacancyCard from '../../features/VacancyCard/VacancyCard';
import SimpleProfileCard from '../../features/SimpleProfileCard/SimpleProfileCard';
import MessagesPanel from '../../features/MessagesPanel/MessagesPanel';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const COMPANY_TABS = [
  { id: 'posts', key: 'company.tab.posts' },
  { id: 'jobs', key: 'company.tab.jobs' },
  { id: 'team', key: 'company.tab.team' },
  { id: 'about', key: 'company.tab.about' },
];

const CompanyPage = () => {
  const { t } = useTranslation();
  const { id: companyId } = useParams();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followError, setFollowError] = useState('');

  const [posts, setPosts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [team, setTeam] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  const loadCompany = useCallback(async () => {
    setLoading(true);
    setFollowError('');

    try {
      const [page, followedPages] = await Promise.all([
        getPageById(companyId),
        getMyFollowedPages(),
      ]);

      setCompany({
        page,
        followersCount: page.followersCount ?? 0,
        verified: false,
      });
      setIsFollowing(
        followedPages.some((item) => String(item.id) === String(companyId)),
      );
    } catch {
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadCompany();
  }, [loadCompany]);

  useEffect(() => {
    const page = company?.page;
    if (!page) return undefined;

    let cancelled = false;
    setTabLoading(true);

    (async () => {
      try {
        if (activeTab === 'posts' && page.ownerId) {
          const response = await getUserPosts(page.ownerId, { page: 1, pageSize: 20 });
          if (!cancelled) setPosts(response.items ?? []);
          return;
        }

        if (activeTab === 'jobs') {
          const response = await getVacancies({ companyId: page.id, page: 1, pageSize: 20 });
          if (!cancelled) setJobs(response.items ?? []);
          return;
        }

        if (activeTab === 'team') {
          const followers = await getPageFollowers(page.id);
          const enriched = await enrichUsersWithProfiles(
            followers,
            (row) => row.userId ?? row.UserId ?? row.id,
          );
          if (!cancelled) setTeam(enriched);
        }
      } catch {
        if (!cancelled) {
          if (activeTab === 'posts') setPosts([]);
          if (activeTab === 'jobs') setJobs([]);
          if (activeTab === 'team') setTeam([]);
        }
      } finally {
        if (!cancelled) setTabLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeTab, company]);

  const handleFollowToggle = async () => {
    const pageId = company?.page?.id;
    if (!pageId || followLoading) return;

    setFollowLoading(true);
    setFollowError('');

    try {
      if (isFollowing) {
        await unfollowPage(pageId);
        setIsFollowing(false);
        setCompany((prev) => prev && {
          ...prev,
          followersCount: Math.max(0, (prev.followersCount ?? 0) - 1),
        });
      } else {
        await followPage(pageId);
        setIsFollowing(true);
        setCompany((prev) => prev && {
          ...prev,
          followersCount: (prev.followersCount ?? 0) + 1,
        });
        await loadCompany();
      }
    } catch (error) {
      setFollowError(getErrorMessage(error));
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return <main className="main-content">{t('common.loading', 'Loading...')}</main>;
  }

  if (!company) {
    return <main className="main-content">{t('company.notFound', 'Company not found')}</main>;
  }

  const { page, followersCount, verified } = company;

  return (
    <main className="main-content">
      <div className="container">
        <div className="company-page">
          <div className="company-header">
            <div className="company-cover">
              <img
                src={getAssetUrl(page.imageUrl || page.logoUrl, IMAGE_PLACEHOLDERS.cover)}
                alt={page.name}
              />
            </div>

            <div className="company-header-content">
              <div className="company-header-main">
                <img
                  src={getAssetUrl(page.imageUrl || page.logoUrl, IMAGE_PLACEHOLDERS.company)}
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
                    <span>{t('company.followersCount', '{n} followers', { n: followersCount })}</span>
                  </div>
                </div>
              </div>

              <div className="company-actions">
                {followError && <p className="follow-error">{followError}</p>}
                <button
                  type="button"
                  className={`btn-primary ${isFollowing ? 'following' : ''}`}
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                >
                  {isFollowing ? (
                    <>
                      <CheckCircle size={18} />
                      {t('network.followingBack', 'Following')}
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      {t('network.follow', 'Follow')}
                    </>
                  )}
                </button>

                <button type="button" className="btn-secondary">
                  <Share2 size={18} />
                  {t('common.share', 'Share')}
                </button>

                <button type="button" className="btn-secondary">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="company-content-grid">
            <aside className="company-sidebar">
              <div className="company-about-card">
                <h3>{t('company.about', 'About')}</h3>
                <p>{page.description || t('network.pages.noDescription', 'No description yet.')}</p>

                <div className="company-details">
                  <div className="detail-item">
                    <Building2 size={16} />
                    <span>{t('company.pageLabel', 'Company page')}</span>
                  </div>
                </div>
              </div>
            </aside>

            <div className="company-main-content">
              <div className="company-tabs">
                {COMPANY_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`company-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {t(tab.key, tab.id.charAt(0).toUpperCase() + tab.id.slice(1))}
                  </button>
                ))}
              </div>

              {tabLoading && <p className="company-tab-loading">{t('common.loading', 'Loading...')}</p>}

              {activeTab === 'posts' && !tabLoading && (
                <div className="company-posts">
                  {posts.length === 0 ? (
                    <p>{t('company.emptyPosts', 'No posts yet')}</p>
                  ) : (
                    posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onDeleted={(postId) =>
                          setPosts((prev) => prev.filter((item) => item.id !== postId))
                        }
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'jobs' && !tabLoading && (
                <div className="company-jobs">
                  {jobs.length === 0 ? (
                    <p>{t('company.emptyJobs', 'No jobs yet')}</p>
                  ) : (
                    jobs.map((job) => <VacancyCard key={job.id} vacancy={job} />)
                  )}
                </div>
              )}

              {activeTab === 'team' && !tabLoading && (
                <div className="company-team">
                  {team.length === 0 ? (
                    <p>{t('company.emptyTeam', 'No followers yet')}</p>
                  ) : (
                    team.map((member) => (
                      <div key={member.userId ?? member.id} className="company-team-member">
                        <img
                          src={getAssetUrl(member.avatarUrl, IMAGE_PLACEHOLDERS.avatar)}
                          alt={member.displayName || member.name}
                          className="company-team-avatar"
                        />
                        <div>
                          <strong>{member.displayName || member.name}</strong>
                          {member.headline ? <p>{member.headline}</p> : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'about' && (
                <div className="company-about-full">
                  <div className="about-section">
                    <h2>{t('company.overview', 'Overview')}</h2>
                    <p>{page.description || t('network.pages.noDescription', 'No description yet.')}</p>
                  </div>

                  <div className="about-section">
                    <h2>{t('company.infoTitle', 'Company Information')}</h2>
                    <div className="info-grid">
                      <div className="info-card">
                        <Users size={24} />
                        <div>
                          <span className="info-label">{t('company.followersLabel', 'Followers')}</span>
                          <span className="info-value">{followersCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <aside className="company-sidebar-right">
              <SimpleProfileCard />
              <MessagesPanel />
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CompanyPage;
