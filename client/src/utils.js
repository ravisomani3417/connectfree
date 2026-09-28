export const CATEGORIES = ['tech', 'career', 'social', 'lifestyle'];

export const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

export const notifText = (n) =>
  ({
    like: 'liked your post',
    comment: 'commented on your post',
    follow: 'started following you',
    connection_request: 'sent you a connection request',
    connection_accepted: 'accepted your connection request',
  }[n.type] || 'interacted with you');
