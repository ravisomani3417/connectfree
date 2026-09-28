import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Reels from './pages/Reels';
import Network from './pages/Network';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import Search from './pages/Search';

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center muted">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/" element={<Private><Home /></Private>} />
        <Route path="/reels" element={<Private><Reels /></Private>} />
        <Route path="/network" element={<Private><Network /></Private>} />
        <Route path="/profile/:id" element={<Private><Profile /></Private>} />
        <Route path="/chat" element={<Private><Chat /></Private>} />
        <Route path="/chat/:id" element={<Private><Chat /></Private>} />
        <Route path="/notifications" element={<Private><Notifications /></Private>} />
        <Route path="/search" element={<Private><Search /></Private>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
