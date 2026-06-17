import { Bell, Settings, MoreHorizontal, Image, Video, FileText, Smile } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import './GroupPage.css';
import PostCard from '../../features/PostCard/PostCard';
import SimpleProfileCard from '../../features/SimpleProfileCard/SimpleProfileCard';
import AppContext from '../../features/appContext/AppContext';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import {
  attachPostToGroup,
  getGroupById,
  getGroupMembers,
  getGroupPosts,
  getMyGroups,
  joinGroup,
  leaveGroup,
} from '../../features/network/networkApi.js';
import { enrichUsersWithProfiles } from '../../features/network/enrichNetworkProfiles.js';
import { createPost, getPostById, uploadPostMedia } from '../../features/content/contentApi.js';
import { mapPostToCreateRequest } from '../../features/content/mapContent.js';
import { getErrorMessage } from '../../shared/lib/apiError.js';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const GROUP_TABS = [
  { id: 'posts', key: 'group.tab.posts' },
  { id: 'members', key: 'group.tab.members' },
  { id: 'about', key: 'group.tab.about' },
];

const GroupPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState(null);
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postError, setPostError] = useState('');
  const imageInputRef = useRef(null);
  const { id: groupId } = useParams();
  const { user, profile } = useContext(AppContext);

  const [group, setGroup] = useState(null);
  const [groupLoading, setGroupLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipError, setMembershipError] = useState('');

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const u = profile?.user;

  const reloadGroup = useCallback(async () => {
    setGroupLoading(true);
    setMembershipError('');

    try {
      const myGroups = await getMyGroups();
      const member = myGroups.some((item) => String(item.id) === String(groupId));
      setIsMember(member);

      if (!member) {
        setGroup(null);
        return;
      }

      const data = await getGroupById(groupId);
      setGroup(data);
    } catch (err) {
      console.error('GROUP LOAD ERROR', err);
      setGroup(null);
    } finally {
      setGroupLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    reloadGroup();
  }, [reloadGroup]);

  useEffect(() => {
    if (!isMember || activeTab !== 'posts') return undefined;

    let cancelled = false;
    setPostsLoading(true);

    getGroupPosts(groupId)
      .then(async (links) => {
        if (cancelled) return;

        const loaded = await Promise.all(
          links.map(async (link) => {
            if (!link.postId) return null;
            try {
              return await getPostById(link.postId);
            } catch {
              return null;
            }
          }),
        );

        if (!cancelled) {
          setPosts(loaded.filter(Boolean));
        }
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      })
      .finally(() => {
        if (!cancelled) setPostsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, groupId, isMember]);

  useEffect(() => {
    if (!isMember || activeTab !== 'members') return undefined;

    let cancelled = false;
    setMembersLoading(true);

    getGroupMembers(groupId)
      .then(async (rawMembers) => {
        if (cancelled) return;

        const enriched = await enrichUsersWithProfiles(
          rawMembers,
          (member) => member.userId,
        );

        if (!cancelled) {
          setMembers(
            enriched.map((member) => ({
              id: member.userId,
              role: member.role,
              user: {
                firstName: member.firstName,
                secondName: member.secondName,
                avatarUrl: member.avatarUrl,
                profileTitle: member.headline || member.profileTitle || '',
              },
            })),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setMembers([]);
      })
      .finally(() => {
        if (!cancelled) setMembersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, groupId, isMember]);

  const handleJoinLeave = async () => {
    if (membershipLoading) return;

    setMembershipLoading(true);
    setMembershipError('');

    try {
      if (isMember) {
        await leaveGroup(groupId);
        setIsMember(false);
        setGroup(null);
        setPosts([]);
        setMembers([]);
      } else {
        await joinGroup(groupId);
        setIsMember(true);
        await reloadGroup();
      }
    } catch (err) {
      setMembershipError(getErrorMessage(err));
    } finally {
      setMembershipLoading(false);
    }
  };

  const handleCreatePost = async () => {
    const content = postContent.trim();
    if ((!content && !postImage) || postSubmitting || !isMember) return;

    setPostSubmitting(true);
    setPostError('');

    try {
      let mediaIds;

      if (postImage) {
        const uploaded = await uploadPostMedia(postImage);
        if (uploaded?.id) {
          mediaIds = [uploaded.id];
        }
      }

      const created = await createPost(
        mapPostToCreateRequest({
          content: content || ' ',
          visibility: 'Public',
          mediaIds,
        }),
      );

      if (created?.id) {
        await attachPostToGroup(groupId, created.id);
        setPostContent('');
        setPostImage(null);
        setPostImagePreview(null);
        const loaded = await getPostById(created.id);
        setPosts((prev) => [loaded, ...prev]);
      }
    } catch (err) {
      setPostError(getErrorMessage(err));
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleImageSelect = (file) => {
    setPostImage(file ?? null);
    if (file) {
      setPostImagePreview(URL.createObjectURL(file));
    } else {
      setPostImagePreview(null);
    }
  };

  if (!user || !profile?.user) {
    return <div className="main-content">{t('group.loadingProfile', 'Loading profile...')}</div>;
  }

  if (groupLoading) {
    return <div className="main-content">{t('group.loading', 'Loading group...')}</div>;
  }

  if (!isMember) {
    return (
      <main className="main-content">
        <div className="container">
          <div className="group-page group-page--join">
            <h1>{t('group.joinTitle', 'Join this group')}</h1>
            <p>{t('group.joinSub', 'You need to be a member to view group content.')}</p>
            {membershipError && <p className="auth-error">{membershipError}</p>}
            <button
              type="button"
              className="btn-primary"
              onClick={handleJoinLeave}
              disabled={membershipLoading}
            >
              {membershipLoading
                ? t('group.joining', 'Joining...')
                : t('group.join', 'Join group')}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!group) {
    return <div className="main-content">{t('group.notFound', 'Group not found')}</div>;
  }

  return (
    <main className="main-content">
      <div className="container">
        <div className="group-page">
          <div className="group-header">
            <div className="group-cover">
              <img src={getAssetUrl(group.imageUrl || group.avatarUrl, IMAGE_PLACEHOLDERS.cover)} alt={group.name} />
            </div>
            <div className="group-header-content">
              <div className="group-header-main">
                <img src={getAssetUrl(group.imageUrl || group.avatarUrl, IMAGE_PLACEHOLDERS.cover)} alt={group.name} className="group-avatar" />
                <div className="group-info">
                  <h1 className="group-name">{group.name}</h1>
                  <p className="group-category">{t('group.label', 'Group')}</p>
                  <div className="group-stats">
                    <span>{t('group.membersCount', '{n} members', { n: group.membersCount })}</span>
                    <span className="stat-separator">•</span>
                    <span>{t('group.postsPerWeek', '{n} posts/week', { n: group.postsPerWeek })}</span>
                  </div>
                </div>
              </div>
              <div className="group-actions">
                {membershipError && <p className="auth-error">{membershipError}</p>}
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleJoinLeave}
                  disabled={membershipLoading}
                >
                  <Bell size={18} />
                  {membershipLoading
                    ? t('group.updating', 'Updating...')
                    : t('group.joinedLeave', 'Joined · Leave')}
                </button>
                <button type="button" className="btn-secondary">
                  <Settings size={18} />
                </button>
                <button type="button" className="btn-secondary">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="group-content-grid">
            <aside className="group-sidebar">
              <div className="group-about-card">
                <h3>{t('group.aboutTitle', 'About this group')}</h3>
                <p>{group.description}</p>
              </div>
              <div className="group-rules-card">
                <h3>{t('group.rulesTitle', 'Group rules')}</h3>
                <ul>
                  {Array.isArray(group.rules) &&
                    group.rules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                </ul>
              </div>
            </aside>

            <div className="group-main-content">
              <div className="group-tabs">
                {GROUP_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`group-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {t(tab.key, tab.id.charAt(0).toUpperCase() + tab.id.slice(1))}
                  </button>
                ))}
              </div>

              {activeTab === 'posts' && (
                <div className="group-posts">
                  <div className="group-create-post">
                    <img
                      src={getAssetUrl(u?.avatarUrl || u?.avatar, IMAGE_PLACEHOLDERS.avatar)}
                      alt={`${u.firstName} ${u.secondName}`}
                      className="post-avatar"
                    />

                    <div className="post-input-container">
                      <textarea
                        placeholder={t('group.composerPlaceholder', 'Share something with the group...')}
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        className="post-textarea"
                      />
                      {postImagePreview ? (
                        <div className="group-post-preview">
                          <img src={postImagePreview} alt={t('common.uploadPreview', 'Upload preview')} />
                        </div>
                      ) : null}
                      {postError && <p className="auth-error">{postError}</p>}
                      <div className="post-actions">
                        <div className="post-action-buttons">
                          <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => handleImageSelect(e.target.files?.[0] || null)}
                          />
                          <button
                            className="post-action-btn"
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            title={t('group.addPhoto', 'Add photo')}
                          >
                            <Image size={20} />
                            {t('home.imagePost', 'Photo')}
                          </button>
                          <button className="post-action-btn" type="button" disabled title={t('group.comingSoon', 'Coming soon')}>
                            <Video size={20} />
                            {t('home.composer.video', 'Video')}
                          </button>
                          <button className="post-action-btn" type="button" disabled title={t('group.comingSoon', 'Coming soon')}>
                            <FileText size={20} />
                            {t('group.document', 'Document')}
                          </button>
                          <button className="post-action-btn" type="button" disabled title={t('group.comingSoon', 'Coming soon')}>
                            <Smile size={20} />
                          </button>
                        </div>
                        <button
                          className="btn-primary btn-post"
                          type="button"
                          onClick={handleCreatePost}
                          disabled={postSubmitting || (!postContent.trim() && !postImage)}
                        >
                          {postSubmitting
                            ? t('group.posting', 'Posting...')
                            : t('group.post', 'Post')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {postsLoading && <div>{t('group.loadingPosts', 'Loading posts...')}</div>}

                  <div className="group-posts-list">
                    {!postsLoading && posts.length === 0 && (
                      <p>{t('group.emptyPosts', 'No posts in this group yet.')}</p>
                    )}
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onDeleted={(postId) =>
                          setPosts((prev) => prev.filter((item) => item.id !== postId))
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="group-members-list">
                  {membersLoading && <div>{t('group.loadingMembers', 'Loading members...')}</div>}

                  {!membersLoading && members.map((m) => (
                    <div key={m.id} className="member-item">
                      <img
                        src={getAssetUrl(m.user?.avatarUrl, IMAGE_PLACEHOLDERS.avatar)}
                        alt={`${m.user?.firstName} ${m.user?.secondName}`}
                        className="member-avatar"
                      />

                      <div className="member-info">
                        <h4
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(`/app/profile/${m.id}`)}
                          onKeyDown={() => {}}
                          style={{ cursor: 'pointer' }}
                        >
                          {m.user?.firstName} {m.user?.secondName}
                        </h4>
                        <p>{m.user?.profileTitle}</p>
                        <span className="member-role">{m.role}</span>
                      </div>

                      <button
                        className="btn-secondary"
                        type="button"
                        onClick={() => navigate('/app/messages')}
                      >
                        {t('userProfile.message', 'Message')}
                      </button>
                    </div>
                  ))}

                  {!membersLoading && members.length === 0 && (
                    <div>{t('group.noMembers', 'No members')}</div>
                  )}
                </div>
              )}

              {activeTab === 'about' && (
                <div className="group-about-content">
                  <div className="about-section">
                    <h3>{t('group.description', 'Description')}</h3>
                    <p>{group.description}</p>
                  </div>
                  <div className="about-section">
                    <h3>{t('group.infoTitle', 'Group Information')}</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">{t('group.category', 'Category')}</span>
                        <span className="info-value">{group.category}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">{t('group.members', 'Members')}</span>
                        <span className="info-value">{group.membersCount}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">{t('group.activity', 'Activity')}</span>
                        <span className="info-value">
                          {t('group.postsPerWeek', '{n} posts/week', { n: group.postsPerWeek })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <aside className="group-sidebar-right">
              <SimpleProfileCard />
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GroupPage;
