import { Bell, Settings, MoreHorizontal, Image, Video, FileText, Smile } from 'lucide-react';
import './GroupPage.css';
import PostCard from '../../features/PostCard/PostCard';
import SimpleProfileCard from '../../features/SimpleProfileCard/SimpleProfileCard';
import { useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import AppContext from '../../features/appContext/AppContext';
import { fileUrl } from '../../shared/api/files';
import { getGroupById, getGroupMembers, getGroupPosts } from '../../features/network/networkApi.js';
import { enrichUsersWithProfiles } from '../../features/network/enrichNetworkProfiles.js';
import { getPostById } from '../../features/content/contentApi.js';

const GroupPage = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [postContent, setPostContent] = useState('');
  const { id: groupId } = useParams();
  const { user, profile } = useContext(AppContext);
  const [group, setGroup] = useState(null);
  const [groupLoading, setGroupLoading] = useState(true);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const u = profile?.user;

  useEffect(() => {
    let cancelled = false;
    setGroupLoading(true);

    getGroupById(groupId)
      .then((data) => {
        if (!cancelled) setGroup(data);
      })
      .catch((err) => {
        console.error('GROUP LOAD ERROR', err);
        if (!cancelled) setGroup(null);
      })
      .finally(() => {
        if (!cancelled) setGroupLoading(false);
      });

    return () => { cancelled = true; };
  }, [groupId]);

  useEffect(() => {
    if (activeTab !== 'posts') return;

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

    return () => { cancelled = true; };
  }, [activeTab, groupId]);

  useEffect(() => {
    if (activeTab !== 'members') return;

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

    return () => { cancelled = true; };
  }, [activeTab, groupId]);

  if (!user || !profile?.user) {
    return <div className="main-content">Loading profile...</div>;
  }

  if (groupLoading) {
    return <div className="main-content">Loading group...</div>;
  }

  if (!group) {
    return <div className="main-content">Group not found</div>;
  }

  return (
    <main className="main-content">
      <div className="container">
        <div className="group-page">
          <div className="group-header">
            <div className="group-cover">
              <img src={group.avatarUrl ? fileUrl(group.avatarUrl) : '/assets/group-cover.jpg'} alt={group.name} />
            </div>
            <div className="group-header-content">
              <div className="group-header-main">
                <img src={group.avatarUrl ? fileUrl(group.avatarUrl) : '/assets/group-cover.jpg'} alt={group.name} className="group-avatar" />
                <div className="group-info">
                  <h1 className="group-name">{group.name}</h1>
                  <p className="group-category">Group</p>
                  <div className="group-stats">
                    <span>{group.membersCount} members</span>
                    <span className="stat-separator">•</span>
                    <span>{group.postsPerWeek} posts/week</span>
                  </div>
                </div>
              </div>
              <div className="group-actions">
                <button className="btn-primary">
                  <Bell size={18} />
                  Joined
                </button>
                <button className="btn-secondary">
                  <Settings size={18} />
                </button>
                <button className="btn-secondary">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="group-content-grid">
            <aside className="group-sidebar">
              <div className="group-about-card">
                <h3>About this group</h3>
                <p>{group.description}</p>
              </div>
              <div className="group-rules-card">
                <h3>Group rules</h3>
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
                <button
                  className={`group-tab ${activeTab === 'posts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('posts')}
                >
                  Posts
                </button>
                <button
                  className={`group-tab ${activeTab === 'members' ? 'active' : ''}`}
                  onClick={() => setActiveTab('members')}
                >
                  Members
                </button>
                <button
                  className={`group-tab ${activeTab === 'about' ? 'active' : ''}`}
                  onClick={() => setActiveTab('about')}
                >
                  About
                </button>
              </div>

              {activeTab === 'posts' && (
                <div className="group-posts">
                  <div className="group-create-post">
                    <img
                      src={
                        u?.avatarUrl
                          ? fileUrl(u.avatarUrl)
                          : 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
                      }
                      alt={`${u.firstName} ${u.secondName}`}
                      className="post-avatar"
                    />

                    <div className="post-input-container">
                      <textarea
                        placeholder="Share something with the group..."
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        className="post-textarea"
                      />
                      <div className="post-actions">
                        <div className="post-action-buttons">
                          <button className="post-action-btn" type="button" disabled title="Coming soon">
                            <Image size={20} />
                            Photo
                          </button>
                          <button className="post-action-btn" type="button" disabled title="Coming soon">
                            <Video size={20} />
                            Video
                          </button>
                          <button className="post-action-btn" type="button" disabled title="Coming soon">
                            <FileText size={20} />
                            Document
                          </button>
                          <button className="post-action-btn" type="button" disabled title="Coming soon">
                            <Smile size={20} />
                          </button>
                        </div>
                        <button className="btn-primary btn-post" type="button" disabled title="Coming soon">
                          Post
                        </button>
                      </div>
                    </div>
                  </div>

                  {postsLoading && <div>Loading posts...</div>}

                  <div className="group-posts-list">
                    {!postsLoading && posts.length === 0 && (
                      <p>No posts in this group yet.</p>
                    )}
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="group-members-list">
                  {membersLoading && <div>Loading members...</div>}

                  {!membersLoading && members.map((m) => (
                    <div key={m.id} className="member-item">
                      <img
                        src={m.user?.avatarUrl ? fileUrl(m.user.avatarUrl) : '/assets/avatar-placeholder.png'}
                        alt={`${m.user?.firstName} ${m.user?.secondName}`}
                        className="member-avatar"
                      />

                      <div className="member-info">
                        <h4>
                          {m.user?.firstName} {m.user?.secondName}
                        </h4>
                        <p>{m.user?.profileTitle}</p>
                        <span className="member-role">{m.role}</span>
                      </div>

                      <button className="btn-secondary" type="button">Message</button>
                    </div>
                  ))}

                  {!membersLoading && members.length === 0 && (
                    <div>No members</div>
                  )}
                </div>
              )}

              {activeTab === 'about' && (
                <div className="group-about-content">
                  <div className="about-section">
                    <h3>Description</h3>
                    <p>{group.description}</p>
                  </div>
                  <div className="about-section">
                    <h3>Group Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Category</span>
                        <span className="info-value">{group.category}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Members</span>
                        <span className="info-value">{group.membersCount}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Activity</span>
                        <span className="info-value">{group.postsPerWeek} posts/week</span>
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
