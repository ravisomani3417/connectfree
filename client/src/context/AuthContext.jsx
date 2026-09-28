import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((r) => setUser(r.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const save = ({ token, user }) => {
    localStorage.setItem('token', token);
    setUser(user);
  };
  const login = async (body) => save((await api.post('/auth/login', body)).data);
  const register = async (body) => save((await api.post('/auth/register', body)).data);
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return <Ctx.Provider value={{ user, setUser, loading, login, register, logout }}>{children}</Ctx.Provider>;
}
