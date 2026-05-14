import { NavLink, Outlet } from 'react-router-dom';

const NAV = [
  { path: '/buyer/listings', label: 'Browse Produce' },
  { path: '/buyer/orders', label: 'My Orders' },
  { path: '/buyer/profile', label: 'Profile' },
];

export function BuyerLayout() {
  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      <aside className="w-48 bg-white border-r shrink-0">
        <nav className="p-3 space-y-0.5">
          {NAV.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
