import { useEffect, useState } from 'react';
import api from '../api';
import StoriesBar from '../components/StoriesBar';
import PostComposer from '../components/PostComposer';
import PostCard from '../components/PostCard';
import Suggestions from '../components/Suggestions';
import { CATEGORIES } from '../utils';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [scope, setScope] = useState('following');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async (p, reset) => {
    setLoading(true);
    try {
      const { data } = await api.get('/posts/feed', { params: { scope, category, page: p } });
      setPosts((prev) => (reset ? data.posts : [...prev, ...data.posts]));
      setHasMore(data.hasMore);
      setPage(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1, true); }, [scope, category]);

  return (
    <main className="layout two-col">
      <section>
        <StoriesBar />
        <PostComposer onCreated={(p) => setPosts((prev) => [p, ...prev])} />

        <div className="card tabs">
          <div className="row gap">
            {['following', 'explore'].map((s) => (
              <button key={s} className={`tab ${scope === s ? 'active' : ''}`} onClick={() => setScope(s)}>
                {s === 'following' ? 'Following' : 'Explore'}
              </button>
            ))}
          </div>
          <div className="row gap wrap">
            {['all', ...CATEGORIES].map((c) => (
              <button key={c} className={`chip btn-chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
        </div>

        {posts.map((p) => (
          <PostCard key={p._id} post={p} onDelete={(id) => setPosts((prev) => prev.filter((x) => x._id !== id))} />
        ))}
        {!loading && posts.length === 0 && (
          <div className="card center muted">Nothing here yet. Follow people, or switch to Explore.</div>
        )}
        {hasMore && <button className="btn ghost block" disabled={loading} onClick={() => load(page + 1, false)}>{loading ? 'Loading…' : 'Load more'}</button>}
      </section>
      <aside><Suggestions /></aside>
    </main>
  );
}
