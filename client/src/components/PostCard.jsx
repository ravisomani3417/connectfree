import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { media } from '../api';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { timeAgo } from '../utils';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [data, setData] = useState(post);
  const [likes, setLikes] = useState(post.likes);
  const [count, setCount] = useState(post.commentsCount);
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.text);

  const liked = likes.includes(user._id);
  const mine = data.author?._id === user._id;

  // Optimistic like: update UI first, roll back if the request fails
  const like = async () => {
    const prev = likes;
    setLikes(liked ? likes.filter((i) => i !== user._id) : [...likes, user._id]);
    try {
      await api.put(`/posts/${data._id}/like`);
    } catch {
      setLikes(prev);
    }
  };

  const toggleComments = async () => {
    if (!open) setComments((await api.get(`/posts/${data._id}/comments`)).data);
    setOpen(!open);
  };

  const sendComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const { data: c } = await api.post(`/posts/${data._id}/comments`, { text });
    setComments([...comments, c]);
    setCount(count + 1);
    setText('');
  };

  const saveEdit = async () => {
    const { data: updated } = await api.put(`/posts/${data._id}`, { text: draft });
    setData(updated);
    setEditing(false);
  };

  const remove = async () => {
    if (!window.confirm('Delete this post?')) return;
    await api.delete(`/posts/${data._id}`);
    onDelete?.(data._id);
  };

  const renderText = (t) =>
    t.split(/(#\w+)/g).map((part, i) =>
      part.startsWith('#') ? <Link key={i} className="tag" to={`/search?q=${encodeURIComponent(part)}`}>{part}</Link> : part
    );

  return (
    <article className="card post">
      <div className="row between">
        <Link to={`/profile/${data.author?._id}`} className="row gap plain">
          <Avatar user={data.author} />
          <div>
            <strong>{data.author?.name}</strong>
            <div className="muted small-text">{data.author?.headline || `@${data.author?.username}`} · {timeAgo(data.createdAt)}</div>
          </div>
        </Link>
        <span className={`chip cat-${data.category}`}>{data.category}</span>
      </div>

      {editing ? (
        <div className="stack">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} />
          <div className="row gap">
            <button className="btn small" onClick={saveEdit}>Save</button>
            <button className="btn ghost small" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        data.text && <p className="post-text">{renderText(data.text)}</p>
      )}

      {data.mediaType === 'image' && <img className="post-media" src={media(data.media)} alt="" />}
      {data.mediaType === 'video' && <video className="post-media" src={media(data.media)} controls />}

      <div className="row gap actions">
        <button className={`act ${liked ? 'on' : ''}`} onClick={like}>{liked ? '❤️' : '🤍'} {likes.length}</button>
        <button className="act" onClick={toggleComments}>💬 {count}</button>
        {mine && (
          <>
            <button className="act" onClick={() => setEditing(true)}>✏️ Edit</button>
            <button className="act" onClick={remove}>🗑️ Delete</button>
          </>
        )}
      </div>

      {open && (
        <div className="comments">
          {comments.map((c) => (
            <div key={c._id} className="row gap comment">
              <Avatar user={c.user} size={28} />
              <div><strong>{c.user?.name}</strong> {c.text}</div>
            </div>
          ))}
          <form className="row gap" onSubmit={sendComment}>
            <input placeholder="Write a comment…" value={text} onChange={(e) => setText(e.target.value)} />
            <button className="btn small">Send</button>
          </form>
        </div>
      )}
    </article>
  );
}
