import { useEffect, useState } from 'react';
import api, { media } from '../api';
import Avatar from './Avatar';
import { timeAgo } from '../utils';

export default function StoryViewer({ groups, start, onClose }) {
  const [g, setG] = useState(start);
  const [s, setS] = useState(0);
  const group = groups[g];
  const story = group.stories[s];

  const next = () => {
    if (s < group.stories.length - 1) setS(s + 1);
    else if (g < groups.length - 1) { setG(g + 1); setS(0); }
    else onClose();
  };
  const prev = () => {
    if (s > 0) setS(s - 1);
    else if (g > 0) { setG(g - 1); setS(0); }
  };

  useEffect(() => {
    api.put(`/stories/${story._id}/view`).catch(() => {});
    if (story.mediaType === 'image') {
      const t = setTimeout(next, 5000);
      return () => clearTimeout(t);
    }
  }, [g, s]);

  return (
    <div className="story-overlay" onClick={onClose}>
      <div className="story-box" onClick={(e) => e.stopPropagation()}>
        <div className="story-bars">
          {group.stories.map((_, i) => <span key={i} className={i <= s ? 'done' : ''} />)}
        </div>
        <div className="row gap story-head">
          <Avatar user={group.author} size={34} />
          <strong>{group.author.name}</strong>
          <span className="muted small-text">{timeAgo(story.createdAt)}</span>
          <button className="link-btn close" onClick={onClose}>✕</button>
        </div>
        {story.mediaType === 'image'
          ? <img src={media(story.media)} alt="" />
          : <video src={media(story.media)} autoPlay onEnded={next} controls={false} playsInline />}
        {story.caption && <div className="story-caption">{story.caption}</div>}
        <div className="story-nav left" onClick={prev} />
        <div className="story-nav right" onClick={next} />
      </div>
    </div>
  );
}
