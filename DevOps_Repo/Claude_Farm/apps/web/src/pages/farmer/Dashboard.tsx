import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';

interface Stats {
  activeListings: number;
  activeKg: number;
  ordersInProgress: number;
  soldThisMonthCents: number;
  nextPayoutCents: number;
  nextPayoutDue: string | null;
}

interface RecentOrder {
  id: string;
  status: string;
  buyer: { businessName: string };
  items: { listing: { product: string; grade: string } | null; quantityKg: number; subtotalCents: number }[];
  createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  CONFIRMED: 'bg-blue-100 text-blue-700',
  COLLECTION_SCHEDULED: 'bg-purple-100 text-purple-700',
  COLLECTED: 'bg-indigo-100 text-indigo-700',
  IN_TRANSIT: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700',
};

export function FarmerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/farmer/stats'),
      api.get('/farmer/orders?limit=5'),
    ]).then(([s, o]) => {
      setStats(s.data);
      setRecent(o.data.orders);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const fmt = (cents: number) => `R${(cents / 100).toFixed(2)}`;

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (!stats) return <div className="p-8 text-center text-gray-400">Unable to load stats</div>;

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Overview</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Active listings</p>
          <p className="text-2xl font-bold text-green-700">{stats.activeListings}</p>
          <p className="text-xs text-gray-400 mt-0.5">{stats.activeKg.toLocaleString()} kg available</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Orders in progress</p>
          <p className="text-2xl font-bold text-blue-700">{stats.ordersInProgress}</p>
          <p className="text-xs text-gray-400 mt-0.5">awaiting delivery</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Sold this month</p>
          <p className="text-2xl font-bold text-gray-900">{fmt(stats.soldThisMonthCents)}</p>
          <p className="text-xs text-gray-400 mt-0.5">delivered orders</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Next payout</p>
          {stats.nextPayoutCents > 0 ? (
            <>
              <p className="text-2xl font-bold text-green-700">{fmt(stats.nextPayoutCents)}</p>
              {stats.nextPayoutDue && (
                <p className="text-xs text-gray-400 mt-0.5">
                  due {new Date(stats.nextPayoutDue).toLocaleDateString('en-ZA')}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-300">—</p>
              <p className="text-xs text-gray-400 mt-0.5">no pending payout</p>
            </>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Recent orders</p>
          <button onClick={() => navigate('/farmer/orders')} className="text-xs text-green-700 hover:underline">
            View all
          </button>
        </div>
        {recent.length === 0 ? (
          <p className="px-4 py-8 text-sm text-gray-400 text-center">No orders yet</p>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y">
              {recent.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/farmer/orders')}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">#{o.id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3 font-medium">{o.buyer?.businessName}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {o.items.map(i => `${i.quantityKg}kg ${i.listing?.product?.replace(/_/g, ' ') ?? ''}`).join(', ')}
                  </td>
                  <td className="px-4 py-3 font-semibold text-green-700">
                    {fmt(o.items.reduce((s, i) => s + i.subtotalCents, 0))}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[o.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
