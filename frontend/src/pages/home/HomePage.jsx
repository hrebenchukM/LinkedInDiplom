import { useCallback, useContext, useEffect, useState } from 'react';

import './HomePage.css';



import ProfileCard from '../../features/ProfileCard/ProfileCard';

import CreatePost from '../../features/CreatePost/CreatePost';

import PostCard from '../../features/PostCard/PostCard';

import MessagesPanel from '../../features/MessagesPanel/MessagesPanel';

import {

  fetchMySavedPosts,

  getFeedPosts,

  savePost,

  unsavePost,

} from '../../features/content/contentApi.js';

import { enrichPostsWithAuthors } from '../../features/content/enrichPostsWithAuthors.js';

import { getMyContacts } from '../../features/network/networkApi.js';

import { enrichContactsWithProfiles } from '../../features/network/enrichNetworkProfiles.js';

import { DEFAULT_PAGE_SIZE } from '../../shared/api/config.js';

import { getErrorMessage } from '../../shared/lib/apiError.js';

import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

import AiAssistantHomeToast from '../../features/AiAssistantHomeToast/AiAssistantHomeToast.jsx';

import AppContext from '../../features/appContext/AppContext';
import { PROFILE_UPDATED_EVENT } from '../../features/profile/profileApi.js';



const HomePage = ({ onNavigate }) => {

  const { t } = useTranslation();

  const { user, token } = useContext(AppContext);

  const currentUserId =

    user?.id ?? user?.userId ?? null;

  const [feedTab, setFeedTab] = useState('all');

  const [posts, setPosts] = useState([]);

  const [shareContacts, setShareContacts] = useState([]);

  const [savedPostIds, setSavedPostIds] = useState(() => new Set());

  const [savingPostId, setSavingPostId] = useState(null);

  const [feedHint, setFeedHint] = useState('');

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');



  const loadSavedIds = useCallback(async () => {

    if (!token) {

      setSavedPostIds(new Set());

      return;

    }



    try {

      const items = await fetchMySavedPosts();

      setSavedPostIds(

        new Set(

          items

            .filter((item) => !item.unsavedAt && item.postId)

            .map((item) => String(item.postId)),

        ),

      );

    } catch {

      setSavedPostIds(new Set());

    }

  }, [token]);



  const loadPosts = useCallback(async (p = page) => {

    setError('');



    try {

      const result = await getFeedPosts({ page: p, pageSize: DEFAULT_PAGE_SIZE });

      const enriched = await enrichPostsWithAuthors(result.items);

      setPosts(enriched);

      setPage(result.page ?? p);

      setTotalPages(result.totalPages || 1);

    } catch (err) {

      console.error('Feed load error:', err);

      setError(getErrorMessage(err));

      setPosts([]);

    }

  }, [page]);



  const loadSavedPosts = useCallback(async () => {

    setError('');



    try {

      const items = await fetchMySavedPosts();

      const savedPosts = items

        .filter((item) => !item.unsavedAt && item.post?.id)

        .map((item) => item.post);

      const enriched = await enrichPostsWithAuthors(savedPosts);

      setPosts(enriched);

      setPage(1);

      setTotalPages(1);

    } catch (err) {

      console.error('Saved posts load error:', err);

      setError(getErrorMessage(err));

      setPosts([]);

    }

  }, []);



  useEffect(() => {

    loadSavedIds();

  }, [loadSavedIds]);



  useEffect(() => {

    const handleProfileUpdated = (event) => {

      const nextProfile = event.detail?.profile;

      const userId = nextProfile?.userId ?? nextProfile?.user?.id;

      if (!userId) return;

      const userPatch = {
        firstName: nextProfile.user?.firstName,
        secondName: nextProfile.user?.secondName ?? nextProfile.user?.lastName,
        lastName: nextProfile.user?.lastName ?? nextProfile.user?.secondName,
        avatarUrl: nextProfile.user?.avatarUrl,
      };



      setPosts((prev) =>

        prev.map((post) => {

          if (String(post.userId) !== String(userId)) return post;

          const user = { ...post.user, ...userPatch };

          return { ...post, user, author: user };

        }),

      );

    };



    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);

    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);

  }, []);



  useEffect(() => {

    if (!currentUserId) {

      setShareContacts([]);

      return undefined;

    }



    let cancelled = false;



    (async () => {

      try {

        const result = await getMyContacts({ page: 1, pageSize: 100 });

        const enriched = await enrichContactsWithProfiles(result.items, currentUserId);

        if (!cancelled) {

          setShareContacts(

            enriched.map((contact) => ({

              userId: contact.userId,

              name: contact.name,

              avatarUrl: contact.avatarUrl ?? contact.avatar,

            })),

          );

        }

      } catch {

        if (!cancelled) {

          setShareContacts([]);

        }

      }

    })();



    return () => {

      cancelled = true;

    };

  }, [currentUserId]);



  useEffect(() => {

    let cancelled = false;



    (async () => {

      setLoading(true);

      try {

        if (feedTab === 'saved') {

          await loadSavedPosts();

        } else {

          const result = await getFeedPosts({ page, pageSize: DEFAULT_PAGE_SIZE });

          const enriched = await enrichPostsWithAuthors(result.items);

          if (!cancelled) {

            setPosts(enriched);

            setTotalPages(result.totalPages || 1);

          }

        }

      } catch (err) {

        console.error('Feed load error:', err);

        if (!cancelled) {

          setError(getErrorMessage(err));

          setPosts([]);

        }

      } finally {

        if (!cancelled) {

          setLoading(false);

        }

      }

    })();



    return () => {

      cancelled = true;

    };

  }, [feedTab, page, loadSavedPosts]);



  const handlePostCreated = async () => {

    setFeedTab('all');

    setPage(1);

    setLoading(true);

    try {

      await loadPosts(1);

    } finally {

      setLoading(false);

    }

  };



  const handlePostDeleted = (postId) => {

    setPosts((prev) => prev.filter((item) => item.id !== postId));

    setSavedPostIds((prev) => {

      const next = new Set(prev);

      next.delete(String(postId));

      return next;

    });

  };



  const handleToggleSave = async (postId) => {

    if (!token || !postId || savingPostId) return;



    const id = String(postId);

    const wasSaved = savedPostIds.has(id);



    setSavingPostId(id);

    setFeedHint('');



    setSavedPostIds((prev) => {

      const next = new Set(prev);

      if (wasSaved) {

        next.delete(id);

      } else {

        next.add(id);

      }

      return next;

    });



    try {

      if (wasSaved) {

        await unsavePost(postId);

        setFeedHint(t('home.hint.unsavedPost', 'Removed from saved posts.'));

        if (feedTab === 'saved') {

          setPosts((prev) => prev.filter((item) => String(item.id) !== id));

        }

      } else {

        await savePost(postId);

        setFeedHint(t('home.hint.savedPost', 'Post saved.'));

      }

    } catch (err) {

      setSavedPostIds((prev) => {

        const next = new Set(prev);

        if (wasSaved) {

          next.add(id);

        } else {

          next.delete(id);

        }

        return next;

      });

      setFeedHint(getErrorMessage(err) || t('home.hint.saveFailed', 'Could not save post.'));

    } finally {

      setSavingPostId(null);

      window.setTimeout(() => setFeedHint(''), 3200);

    }

  };



  const emptyMessage =

    feedTab === 'saved'

      ? t('home.emptySavedPosts', 'No saved posts yet. Use Save on a post in your feed.')

      : t('home.emptyFeed', 'No posts yet. Be the first to share something.');



  return (

    <main className="main-content">

      <div className="container">

        <div className="content-grid">



          <aside className="sidebar-left">

            <ProfileCard

              activeFeedTab={feedTab}

              onSavedClick={() => {

                setFeedTab('saved');

                setPage(1);

                setError('');

              }}

            />

          </aside>



          <section className="main-feed">

            <div className="feed-tabs" role="tablist" aria-label={t('home.feedTabs', 'Feed filters')}>

              <button

                type="button"

                role="tab"

                aria-selected={feedTab === 'all'}

                className={`feed-tab${feedTab === 'all' ? ' feed-tab--active' : ''}`}

                onClick={() => {

                  setFeedTab('all');

                  setPage(1);

                  setError('');

                }}

              >

                {t('home.feedTab.all', 'All posts')}

              </button>

              <button

                type="button"

                role="tab"

                aria-selected={feedTab === 'saved'}

                className={`feed-tab${feedTab === 'saved' ? ' feed-tab--active' : ''}`}

                onClick={() => {

                  setFeedTab('saved');

                  setPage(1);

                  setError('');

                }}

              >

                {t('home.feedTab.saved', 'Saved')}

              </button>

            </div>



            {feedTab === 'all' ? <CreatePost onPostCreated={handlePostCreated} /> : null}



            {feedHint ? <div className="feed-hint">{feedHint}</div> : null}



            {loading ? (

              <div className="feed-status">{t('common.loadingFeed', 'Loading feed...')}</div>

            ) : null}



            {error ? <div className="auth-error">{error}</div> : null}



            {!loading && !error && posts.length === 0 ? (

              <div className="feed-status">{emptyMessage}</div>

            ) : null}



            {posts.map((post) => (

              <PostCard

                key={post.id}

                post={post}

                onDeleted={handlePostDeleted}

                shareContacts={shareContacts}

                isSaved={savedPostIds.has(String(post.id))}

                onToggleSave={handleToggleSave}

                saving={savingPostId === String(post.id)}

              />

            ))}



            {feedTab === 'all' && totalPages > 1 ? (

              <div className="feed-paginator">

                <button

                  type="button"

                  className="pager-btn"

                  disabled={page === 1 || loading}

                  onClick={() => setPage((p) => p - 1)}

                  aria-label={t('common.prev', 'Previous')}

                >

                  ←

                </button>



                <span className="pager-info">

                  Page <strong>{page}</strong> of {totalPages}

                </span>



                <button

                  type="button"

                  className="pager-btn"

                  disabled={page === totalPages || loading}

                  onClick={() => setPage((p) => p + 1)}

                  aria-label={t('common.next', 'Next')}

                >

                  →

                </button>

              </div>

            ) : null}

          </section>



          <aside className="sidebar-right">

            <MessagesPanel onNavigate={onNavigate} />

          </aside>



        </div>

      </div>

      <AiAssistantHomeToast enabled={Boolean(user)} delayMs={10000} />

    </main>

  );

};



export default HomePage;


