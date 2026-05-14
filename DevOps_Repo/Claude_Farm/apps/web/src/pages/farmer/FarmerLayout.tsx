import { NavLink, Outlet } from 'react-router-dom';

const NAV = [
  { path: '/farmer', label: 'Overview', exact: true },
  { path: '/farmer/listings', label: 'My Listings' },
  { path: '/farmer/orders', label: 'Orders' },
  { path: '/farmer/payouts', label: 'Payouts' },
];

export function FarmerLayout() {
  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      <aside className="w-48 bg-white border-r shrink-0">
        <nav className="p-3 space-y-0.5">
          {NAV.map(({ path, label, exact }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
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
