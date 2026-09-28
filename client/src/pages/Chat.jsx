import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Avatar from '../components/Avatar';
import { timeAgo } from '../utils';

export default function Chat() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket, online } = useSocket();
  const [convs, setConvs] = useState([]);
  const [partner, setPartner] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const bottom = useRef();
  const timer = useRef();

  const loadConvs = () => api.get('/messages/conversations').then((r) => setConvs(r.data));

  useEffect(() => { loadConvs(); }, [id]);

  useEffect(() => {
    setTyping(false);
    if (!id) { setPartner(null); setMsgs([]); return; }
    api.get(`/users/${id}`).then((r) => setPartner(r.data));
    api.get(`/messages/${id}`).then((r) => { setMsgs(r.data); loadConvs(); });
  }, [id]);

  // Live events: incoming message, typing indicator, read receipts
  useEffect(() => {
    if (!socket) return;
    const onMessage = (m) => {
      if (m.sender === id) {
        setMsgs((x) => [...x, m]);
        api.put(`/messages/${id}/read`);
      }
      loadConvs();
    };
    const onTyping = ({ from, isTyping }) => { if (from === id) setTyping(isTyping); };
    const onRead = ({ by }) => {
      if (by === id) setMsgs((x) => x.map((m) => (m.sender === user._id && !m.readAt ? { ...m, readAt: new Date().toISOString() } : m)));
    };
    socket.on('message', onMessage);
    socket.on('typing', onTyping);
    socket.on('messagesRead', onRead);
    return () => {
      socket.off('message', onMessage);
      socket.off('typing', onTyping);
      socket.off('messagesRead', onRead);
    };
  }, [socket, id]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  const onChange = (e) => {
    setText(e.target.value);
    socket?.emit('typing', { to: id, isTyping: true });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => socket?.emit('typing', { to: id, isTyping: false }), 1500);
  };

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const { data } = await api.post(`/messages/${id}`, { text });
    setMsgs((x) => [...x, data]);
    setText('');
    socket?.emit('typing', { to: id, isTyping: false });
    loadConvs();
  };

  const isOnline = (uid) => online.includes(uid);

  return (
    <main className="layout chat">
      <aside className="card chat-list">
        <h3>Messages</h3>
        {convs.length === 0 && <p className="muted small-text">No conversations yet. Open a profile and press Message.</p>}
        {convs.map((c) => (
          <Link key={c.user._id} to={`/chat/${c.user._id}`} className={`conv ${c.user._id === id ? 'active' : ''}`}>
            <div className="presence-wrap">
              <Avatar user={c.user} />
              {isOnline(c.user._id) && <span className="dot" />}
            </div>
            <div className="grow">
              <strong>{c.user.name}</strong>
              <div className="muted small-text ellipsis">{c.lastMessage.text}</div>
            </div>
            {c.unread > 0 && <span className="badge static">{c.unread}</span>}
          </Link>
        ))}
      </aside>

      <section className="card chat-thread">
        {!id || !partner ? (
          <div className="center muted">Select a conversation</div>
        ) : (
          <>
            <div className="row gap chat-head">
              <div className="presence-wrap">
                <Avatar user={partner} />
                {isOnline(partner._id) && <span className="dot" />}
              </div>
              <div>
                <strong>{partner.name}</strong>
                <div className="muted small-text">{typing ? 'typing…' : isOnline(partner._id) ? 'Online' : 'Offline'}</div>
              </div>
            </div>
            <div className="messages">
              {msgs.map((m) => (
                <div key={m._id} className={`bubble ${m.sender === user._id ? 'mine' : ''}`}>
                  {m.text}
                  <small>{timeAgo(m.createdAt)}{m.sender === user._id && (m.readAt ? ' · Seen' : ' · Sent')}</small>
                </div>
              ))}
              {typing && <div className="bubble typing">•••</div>}
              <div ref={bottom} />
            </div>
            <form className="row gap" onSubmit={send}>
              <input placeholder="Type a message…" value={text} onChange={onChange} />
              <button className="btn">Send</button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
