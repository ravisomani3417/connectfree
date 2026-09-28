import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';

export default function Profile() {
  const { id } = useParams();
  const { user: me, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    api.get(`/users/${id}`).then((r) => setProfile(r.data)).catch((e) => setError(errMsg(e)));
    api.get(`/posts/user/${id}`).then((r) => setPosts(r.data));
  };
  useEffect(() => { setEditing(false); load(); }, [id]);

  if (error) return <div className="center error">{error}</div>;
  if (!profile) return <div className="center muted">Loading…</div>;

  const isSelf = profile.connectionStatus === 'self';

  const follow = async () => {
    const { data } = await api.put(`/users/${id}/follow`);
    setProfile({ ...profile, isFollowing: data.isFollowing, followers: Array.from({ length: data.followersCount }) });
  };
  const connect = async () => {
    try { await api.post(`/connections/request/${id}`); load(); } catch (e) { alert(errMsg(e)); }
  };
  const accept = async () => { await api.put(`/connections/${profile.connectionId}/accept`); load(); };

  const startEdit = () => {
    setForm({ name: profile.name, headline: profile.headline, bio: profile.bio, skills: (profile.skills || []).join(', ') });
    setEditing(true);
  };
  const save = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (avatar) fd.append('avatar', avatar);
    const { data } = await api.put('/users/me', fd);
    setUser(data);
    setEditing(false);
    setAvatar(null);
    load();
  };

  const statusBtn = {
    none: <button className="btn ghost" onClick={connect}>Connect</button>,
    sent: <button className="btn ghost" disabled>Request sent</button>,
    received: <button className="btn" onClick={accept}>Accept request</button>,
    connected: <button className="btn ghost" disabled>✓ Connected</button>,
  }[profile.connectionStatus];

  return (
    <main className="layout narrow">
      <div className="card profile-head">
        <div className="cover" />
        <div className="profile-body">
          <Avatar user={profile} size={96} />
          <div className="grow">
            <h2>{profile.name}</h2>
            <div className="muted">@{profile.username}</div>
            {profile.headline && <div>{profile.headline}</div>}
          </div>
          <div className="row gap wrap">
            {isSelf ? (
              <button className="btn ghost" onClick={startEdit}>Edit profile</button>
            ) : (
              <>
                <button className="btn" onClick={follow}>{profile.isFollowing ? 'Following' : 'Follow'}</button>
                {statusBtn}
                <Link className="btn ghost" to={`/chat/${profile._id}`}>Message</Link>
              </>
            )}
          </div>
        </div>
        {profile.bio && <p>{profile.bio}</p>}
        {profile.skills?.length > 0 && (
          <div className="row gap wrap">{profile.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
        )}
        <div className="stats">
          <div><strong>{profile.postsCount}</strong><span>Posts</span></div>
          <div><strong>{profile.followers.length}</strong><span>Followers</span></div>
          <div><strong>{profile.following.length}</strong><span>Following</span></div>
          <div><strong>{profile.connections.length}</strong><span>Connections</span></div>
          {isSelf && <div><strong>{profile.profileViews}</strong><span>Profile views</span></div>}
        </div>
      </div>

      {editing && (
        <form className="card stack" onSubmit={save}>
          <h3>Edit profile</h3>
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Headline (e.g. Full-Stack Developer)" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
          <textarea placeholder="Bio" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <input placeholder="Skills, comma separated" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} />
          <div className="row gap">
            <button className="btn">Save</button>
            <button type="button" className="btn ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      )}

      <h3 className="section-title">Posts</h3>
      {posts.map((p) => <PostCard key={p._id} post={p} onDelete={(pid) => setPosts((prev) => prev.filter((x) => x._id !== pid))} />)}
      {posts.length === 0 && <div className="card center muted">No posts yet.</div>}
    </main>
  );
}
