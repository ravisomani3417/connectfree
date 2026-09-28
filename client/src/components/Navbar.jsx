import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Avatar from './Avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unread } = useSocket();
  const [q, setQ] = useState('');
  const nav = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="navbar">
      <div className="nav-inner">
        <NavLink to="/" className="brand">Connect<span>Free</span></NavLink>
        <form onSubmit={submit} className="nav-search">
          <input placeholder="Search people, posts, #tags" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
        <nav className="nav-links">
          <NavLink to="/" end>🏠<small>Home</small></NavLink>
          <NavLink to="/reels">🎬<small>Reels</small></NavLink>
          <NavLink to="/network">👥<small>Network</small></NavLink>
          <NavLink to="/chat">💬<small>Chat</small></NavLink>
          <NavLink to="/notifications" className="with-badge">
            🔔<small>Alerts</small>
            {unread > 0 && <span className="badge">{unread > 9 ? '9+' : unread}</span>}
          </NavLink>
          <NavLink to={`/profile/${user._id}`}><Avatar user={user} size={26} /><small>Me</small></NavLink>
          <button className="link-btn" onClick={logout}>Logout</button>
        </nav>
      </div>
    </header>
  );
}
