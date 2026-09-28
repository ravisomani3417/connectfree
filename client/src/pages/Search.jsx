import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [result, setResult] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/search', { params: { q } }).then((r) => setResult(r.data)).finally(() => setLoading(false));
  }, [q]);

  return (
    <main className="layout narrow">
      <h3 className="section-title">Results for “{q}”</h3>
      {loading && <p className="muted">Searching…</p>}
      <div className="card">
        <h3>People</h3>
        {result.users.length === 0 && <p className="muted">No people found.</p>}
        {result.users.map((u) => (
          <Link key={u._id} to={`/profile/${u._id}`} className="row gap plain suggestion">
            <Avatar user={u} />
            <div><strong>{u.name}</strong><div className="muted small-text">{u.headline || `@${u.username}`}</div></div>
          </Link>
        ))}
      </div>
      <h3 className="section-title">Posts</h3>
      {result.posts.map((p) => <PostCard key={p._id} post={p} />)}
      {!loading && result.posts.length === 0 && <div className="card center muted">No posts found.</div>}
    </main>
  );
}
