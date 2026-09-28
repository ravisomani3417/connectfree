import { useState } from 'react';
import api, { errMsg } from '../api';
import { CATEGORIES } from '../utils';

export default function PostComposer({ onCreated }) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('tech');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('text', text);
      fd.append('category', category);
      if (file) fd.append('media', file);
      const { data } = await api.post('/posts', fd);
      onCreated(data);
      setText('');
      setFile(null);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card composer" onSubmit={submit}>
      <textarea placeholder="Share a tech update, a thought or a moment… use #hashtags" value={text} onChange={(e) => setText(e.target.value)} rows={3} />
      <div className="row between wrap">
        <div className="row gap">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className="btn ghost small">
            📎 {file ? file.name.slice(0, 18) : 'Photo / Video'}
            <input type="file" accept="image/*,video/*" hidden onChange={(e) => setFile(e.target.files[0] || null)} />
          </label>
        </div>
        <button className="btn" disabled={busy}>{busy ? 'Posting…' : 'Post'}</button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
