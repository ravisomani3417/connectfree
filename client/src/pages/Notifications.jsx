import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useSocket } from '../context/SocketContext';
import Avatar from '../components/Avatar';
import { notifText, timeAgo } from '../utils';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const { setUnread } = useSocket();

  useEffect(() => {
    api.get('/notifications').then((r) => setItems(r.data));
    api.put('/notifications/read-all').then(() => setUnread(0));
  }, []);

  return (
    <main className="layout narrow">
      <div className="card">
        <h3>Notifications</h3>
        {items.length === 0 && <p className="muted">You're all caught up.</p>}
        {items.map((n) => (
          <Link
            key={n._id}
            to={n.type.startsWith('connection') ? '/network' : `/profile/${n.actor?._id}`}
            className={`row gap notif plain ${n.read ? '' : 'unread'}`}
          >
            <Avatar user={n.actor} />
            <div><strong>{n.actor?.name}</strong> {notifText(n)}<div className="muted small-text">{timeAgo(n.createdAt)}</div></div>
          </Link>
        ))}
      </div>
    </main>
  );
}
