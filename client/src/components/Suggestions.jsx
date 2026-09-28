import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import Avatar from './Avatar';

export default function Suggestions({ title = 'People you may know' }) {
  const [list, setList] = useState([]);
  const [followed, setFollowed] = useState({});
  const [sent, setSent] = useState({});

  useEffect(() => { api.get('/users/suggestions').then((r) => setList(r.data)).catch(() => {}); }, []);

  const follow = async (id) => {
    await api.put(`/users/${id}/follow`);
    setFollowed((f) => ({ ...f, [id]: true }));
  };
  const connect = async (id) => {
    try {
      await api.post(`/connections/request/${id}`);
      setSent((s) => ({ ...s, [id]: true }));
    } catch (e) {
      alert(errMsg(e));
    }
  };

  return (
    <div className="card">
      <h3>{title}</h3>
      {list.length === 0 && <p className="muted">No suggestions right now.</p>}
      {list.map((u) => (
        <div key={u._id} className="row between suggestion">
          <Link to={`/profile/${u._id}`} className="row gap plain">
            <Avatar user={u} />
            <div>
              <strong>{u.name}</strong>
              <div className="muted small-text">{u.headline || `@${u.username}`}</div>
              {u.mutual > 0 && <div className="muted small-text">{u.mutual} mutual connection{u.mutual > 1 ? 's' : ''}</div>}
            </div>
          </Link>
          <div className="row gap">
            <button className="btn small" disabled={followed[u._id]} onClick={() => follow(u._id)}>{followed[u._id] ? 'Following' : 'Follow'}</button>
            {!u.connected && <button className="btn ghost small" disabled={sent[u._id]} onClick={() => connect(u._id)}>{sent[u._id] ? 'Sent' : 'Connect'}</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
