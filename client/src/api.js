import axios from 'axios';

export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: `${API}/api` });

// Attach the JWT to every request
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Turn a stored "/uploads/x.jpg" path into a full URL
export const media = (url) => (!url ? '' : url.startsWith('http') ? url : `${API}${url}`);

export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';

export default api;
