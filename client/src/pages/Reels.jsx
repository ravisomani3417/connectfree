import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { media, errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { CATEGORIES } from '../utils';

function ReelItem({ reel }) {
  const { user } = useAuth();
  const ref = useRef();
  const viewed = useRef(false);
  const [likes, setLikes] = useState(reel.likes);
  const [muted, setMuted] = useState(true);
  const liked = likes.includes(user._id);

  // Autoplay when the reel is mostly visible, pause otherwise
  useEffect(() => {
    const v = ref.current;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.play().catch(() => {});
          if (!viewed.current) {
            viewed.current = true;
            api.put(`/reels/${reel._id}/view`).catch(() => {});
          }
        } else v.pause();
      },
      { threshold: 0.7 }
    );
    obs.observe(v);
    return () => obs.disconnect();
  }, []);

  const like = async () => {
    const prev = likes;
    setLikes(liked ? likes.filter((i) => i !== user._id) : [...likes, user._id]);
    try { await api.put(`/reels/${reel._id}/like`); } catch { setLikes(prev); }
  };

  return (
    <div className="reel">
      <video ref={ref} src={media(reel.video)} loop muted={muted} playsInline onClick={() => setMuted(!muted)} />
      <div className="reel-info">
        <Link to={`/profile/${reel.author._id}`} className="row gap plain light">
          <Avatar user={reel.author} size={34} /> <strong>{reel.author.name}</strong>
        </Link>
        <p>{reel.caption}</p>
        <span className={`chip cat-${reel.category}`}>{reel.category}</span>
      </div>
      <div className="reel-actions">
        <button onClick={like}>{liked ? '❤️' : '🤍'}<small>{likes.length}</small></button>
        <button onClick={() => setMuted(!muted)}>{muted ? '🔇' : '🔊'}</button>
        <div className="views">👁 {reel.views}</div>
      </div>
    </div>
  );
}

export default function Reels() {
  const [reels, setReels] = useState([]);
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ caption: '', category: 'tech', file: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async (p, reset) => {
    const { data } = await api.get('/reels', { params: { page: p, category } });
    setReels((prev) => (reset ? data.reels : [...prev, ...data.reels]));
    setHasMore(data.hasMore);
    setPage(p);
  };
  useEffect(() => { load(1, true); }, [category]);

  const upload = async (e) => {
    e.preventDefault();
    if (!form.file) return setError('Choose a video first');
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('video', form.file);
      fd.append('caption', form.caption);
      fd.append('category', form.category);
      const { data } = await api.post('/reels', fd);
      setReels((prev) => [data, ...prev]);
      setShow(false);
      setForm({ caption: '', category: 'tech', file: null });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="reels-page">
      <div className="row between wrap reels-top">
        <div className="row gap wrap">
          {['all', ...CATEGORIES].map((c) => (
            <button key={c} className={`chip btn-chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
        <button className="btn small" onClick={() => setShow(!show)}>+ New reel</button>
      </div>

      {show && (
        <form className="card reel-form" onSubmit={upload}>
          <input type="file" accept="video/*" onChange={(e) => setForm({ ...form, file: e.target.files[0] })} />
          <input placeholder="Caption" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          {error && <p className="error">{error}</p>}
          <button className="btn" disabled={busy}>{busy ? 'Uploading…' : 'Publish reel'}</button>
        </form>
      )}

      <div className="reel-feed">
        {reels.map((r) => <ReelItem key={r._id} reel={r} />)}
        {reels.length === 0 && <div className="card center muted">No reels yet. Be the first to post one!</div>}
        {hasMore && <button className="btn ghost block" onClick={() => load(page + 1, false)}>Load more</button>}
      </div>
    </main>
  );
}
