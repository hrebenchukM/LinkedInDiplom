import { useContext, useEffect, useState } from 'react';
import './HomePage.css';

import AppContext from '../../features/appContext/AppContext';
import ProfileCard from '../../features/ProfileCard/ProfileCard';
import CreatePost from '../../features/CreatePost/CreatePost';
import PostCard from '../../features/PostCard/PostCard';
import MessagesPanel from '../../features/MessagesPanel/MessagesPanel';

const PER_PAGE = 5;

const HomePage = ({ onNavigate }) => {
  const { request } = useContext(AppContext);

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

const loadPosts = async (p = page) => {
  const j = await request(
    `api://post/?page=${p}&perPage=${PER_PAGE}`,
    {},
    true
  );
  setPosts(j.data || []);
  setLastPage(j.meta?.pagination?.lastPage || 1);
};

useEffect(() => {
  loadPosts(page);
}, [page]);


  return (
    <main className="main-content">
      <div className="container">
        <div className="content-grid">

          <aside className="sidebar-left">
            <ProfileCard />
          </aside>

          <section className="main-feed">
<CreatePost
  onPostCreated={() => {
    setPage(1);      // ← вернуть на первую страницу
    loadPosts(1);   // ← СРАЗУ обновить ленту
  }}
/>

            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onNavigate={onNavigate}
              />
            ))}

      {lastPage > 1 && (
        <div className="feed-paginator">
          <button
            className="pager-btn"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            aria-label="Previous page"
          >
            ←
          </button>

          <span className="pager-info">
            Page <strong>{page}</strong> of {lastPage}
          </span>

          <button
            className="pager-btn"
            disabled={page === lastPage}
            onClick={() => setPage(p => p + 1)}
            aria-label="Next page"
          >
            →
          </button>
        </div>
      )}

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
