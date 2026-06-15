import { useEffect, useState } from 'react';
import './HomePage.css';

import ProfileCard from '../../features/ProfileCard/ProfileCard';
import CreatePost from '../../features/CreatePost/CreatePost';
import PostCard from '../../features/PostCard/PostCard';
import MessagesPanel from '../../features/MessagesPanel/MessagesPanel';
import { getFeedPosts } from '../../features/content/contentApi.js';
import { enrichPostsWithAuthors } from '../../features/content/enrichPostsWithAuthors.js';
import { DEFAULT_PAGE_SIZE } from '../../shared/api/config.js';
import { getErrorMessage } from '../../shared/lib/apiError.js';

const HomePage = ({ onNavigate }) => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPosts = async (p = page) => {
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
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const result = await getFeedPosts({ page, pageSize: DEFAULT_PAGE_SIZE });
        const enriched = await enrichPostsWithAuthors(result.items);
        if (!cancelled) {
          setPosts(enriched);
          setTotalPages(result.totalPages || 1);
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
  }, [page]);

  const handlePostCreated = async () => {
    setPage(1);
    setLoading(true);
    try {
      await loadPosts(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content">
      <div className="container">
        <div className="content-grid">

          <aside className="sidebar-left">
            <ProfileCard />
          </aside>

          <section className="main-feed">
            <CreatePost onPostCreated={handlePostCreated} />

            {loading ? (
              <div className="feed-status">Loading feed...</div>
            ) : null}

            {error ? <div className="auth-error">{error}</div> : null}

            {!loading && !error && posts.length === 0 ? (
              <div className="feed-status">No posts yet. Be the first to share something.</div>
            ) : null}

            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onNavigate={onNavigate}
              />
            ))}

            {totalPages > 1 ? (
              <div className="feed-paginator">
                <button
                  type="button"
                  className="pager-btn"
                  disabled={page === 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Previous page"
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
                  aria-label="Next page"
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
    </main>
  );
};

export default HomePage;
