import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth" onSubmit={submit}>
        <h1 className="brand big">Join Connect<span>Free</span></h1>
        <input placeholder="Full name" value={form.name} onChange={set('name')} required />
        <input placeholder="Username (a-z, 0-9, _ .)" value={form.username} onChange={set('username')} required />
        <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <input type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={set('password')} required />
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <p className="muted">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
