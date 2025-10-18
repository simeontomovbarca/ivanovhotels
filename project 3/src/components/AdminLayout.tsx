import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AdminLayout.css';

export default function AdminLayout() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <div className="admin-nav-header">
          <h1>Администраторски панел</h1>
          <div className="admin-nav-actions">
            <span className="admin-user">{user?.email}</span>
            <button onClick={() => signOut()} className="logout-button">Изход</button>
            <Link to="/" className="back-to-site">← Към сайта</Link>
          </div>
        </div>
        <div className="admin-nav-links">
          <Link
            to="/admin/hotels"
            className={location.pathname.includes('/hotels') ? 'active' : ''}
          >
            Хотели
          </Link>
          <Link
            to="/admin/rooms"
            className={location.pathname.includes('/rooms') ? 'active' : ''}
          >
            Стаи
          </Link>
          <Link
            to="/admin/bookings"
            className={location.pathname.includes('/bookings') ? 'active' : ''}
          >
            Резервации
          </Link>
        </div>
      </nav>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
