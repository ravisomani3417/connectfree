import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Avatar from '../components/Avatar';
import Suggestions from '../components/Suggestions';

export default function Network() {
  const [pending, setPending] = useState([]);
  const [connections, setConnections] = useState([]);

  const load = () => {
    api.get('/connections/pending').then((r) => setPending(r.data));
    api.get('/connections').then((r) => setConnections(r.data));
  };
  useEffect(load, []);

  const respond = async (id, action) => {
    await api.put(`/connections/${id}/${action}`);
    load();
  };
  const remove = async (id) => {
    if (!window.confirm('Remove this connection?')) return;
    await api.delete(`/connections/user/${id}`);
    load();
  };

  return (
    <main className="layout two-col">
      <section>
        <div className="card">
          <h3>Invitations ({pending.length})</h3>
          {pending.length === 0 && <p className="muted">No pending invitations.</p>}
          {pending.map((c) => (
            <div key={c._id} className="row between suggestion">
              <Link to={`/profile/${c.requester._id}`} className="row gap plain">
                <Avatar user={c.requester} />
                <div><strong>{c.requester.name}</strong><div className="muted small-text">{c.requester.headline}</div></div>
              </Link>
              <div className="row gap">
                <button className="btn small" onClick={() => respond(c._id, 'accept')}>Accept</button>
                <button className="btn ghost small" onClick={() => respond(c._id, 'reject')}>Ignore</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3>My connections ({connections.length})</h3>
          {connections.length === 0 && <p className="muted">Connect with people to grow your network.</p>}
          {connections.map((u) => (
            <div key={u._id} className="row between suggestion">
              <Link to={`/profile/${u._id}`} className="row gap plain">
                <Avatar user={u} />
                <div><strong>{u.name}</strong><div className="muted small-text">{u.headline}</div></div>
              </Link>
              <div className="row gap">
                <Link className="btn ghost small" to={`/chat/${u._id}`}>Message</Link>
                <button className="btn ghost small" onClick={() => remove(u._id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <aside><Suggestions /></aside>
    </main>
  );
}
