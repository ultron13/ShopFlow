import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth.js';

const NAV_ITEMS: Record<string, { label: string; path: string }[]> = {
  BUYER: [
    { label: 'Produce', path: '/listings' },
    { label: 'My Orders', path: '/orders' },
  ],
  FARMER: [
    { label: 'My Listings', path: '/farmer' },
  ],
  FIELD_AGENT: [
    { label: 'Collections', path: '/grade' },
  ],
  OPS_ADMIN: [
    { label: 'Dashboard', path: '/admin' },
  ],
  PLATFORM_ADMIN: [
    { label: 'Dashboard', path: '/admin' },
  ],
};

export function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const items = NAV_ITEMS[user.role] ?? [];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-green-800 text-white">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg tracking-tight">FarmConnect SA</span>
          <div className="flex gap-1">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  location.pathname === item.path
                    ? 'bg-green-700 font-medium'
                    : 'hover:bg-green-700/60'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-green-200">{user.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-green-300 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
