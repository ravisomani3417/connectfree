import { useEffect, useRef, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import StoryViewer from './StoryViewer';

export default function StoriesBar() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [viewing, setViewing] = useState(null);
  const input = useRef();

  const load = () => api.get('/stories').then((r) => setGroups(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('media', file);
    await api.post('/stories', fd);
    e.target.value = '';
    load();
  };

  return (
    <div className="card stories">
      <div className="story-item" onClick={() => input.current.click()}>
        <div className="ring add">+</div>
        <small>Add story</small>
        <input ref={input} type="file" accept="image/*,video/*" hidden onChange={upload} />
      </div>
      {groups.map((grp, i) => (
        <div key={grp.author._id} className="story-item" onClick={() => setViewing(i)}>
          <div className="ring"><Avatar user={grp.author} size={54} /></div>
          <small>{grp.author._id === user._id ? 'Your story' : grp.author.name.split(' ')[0]}</small>
        </div>
      ))}
      {viewing !== null && <StoryViewer groups={groups} start={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
