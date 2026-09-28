import { media } from '../api';

export default function Avatar({ user, size = 40 }) {
  const style = { width: size, height: size, fontSize: size * 0.4 };
  if (user?.avatar) return <img className="avatar" style={style} src={media(user.avatar)} alt={user.name} />;
  return (
    <div className="avatar fallback" style={style}>
      {(user?.name || '?').charAt(0).toUpperCase()}
    </div>
  );
}
