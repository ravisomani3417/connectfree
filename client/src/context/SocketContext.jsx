import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import api, { API } from '../api';
import { useAuth } from './AuthContext';
import { notifText } from '../utils';

const Ctx = createContext({});
export const useSocket = () => useContext(Ctx);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [online, setOnline] = useState([]);
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user) return;
    const s = io(API, { auth: { token: localStorage.getItem('token') } });
    s.on('presence', setOnline);
    s.on('notification', (n) => {
      setUnread((u) => u + 1);
      setToast(`${n.actor?.name || 'Someone'} ${notifText(n)}`);
      setTimeout(() => setToast(null), 3500);
    });
    setSocket(s);
    api.get('/notifications/unread-count').then((r) => setUnread(r.data.count)).catch(() => {});
    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user?._id]);

  return (
    <Ctx.Provider value={{ socket, online, unread, setUnread }}>
      {children}
      {toast && <div className="toast">🔔 {toast}</div>}
    </Ctx.Provider>
  );
}
