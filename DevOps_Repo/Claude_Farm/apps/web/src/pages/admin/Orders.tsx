import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';

const STATUSES = ['ALL', 'CONFIRMED', 'COLLECTION_SCHEDULED', 'COLLECTED', 'IN_TRANSIT', 'DELIVERED', 'DISPUTED', 'PENDING_PAYMENT', 'CANCELLED'];

const STATUS_STYLE: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  COLLECTION_SCHEDULED: 'bg-purple-100 text-purple-800',
  COLLECTED: 'bg-indigo-100 text-indigo-800',
  IN_TRANSIT: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-green-100 text-green-800',
  DISPUTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

interface Order {
  id: string;
  status: string;
  totalAmountCents: number;
  deliveryDate: string | null;
  createdAt: string;
  buyer: { businessName: string };
  items: { quantityKg: number; listing?: { product: string } }[];
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = tab !== 'ALL' ? `?status=${tab}&limit=100` : '?limit=100';
    api.get(`/orders${params}`).then(({ data }) => {
      setOrders(data.orders);
      setLoading(false);
    });
  }, [tab]);

  const fmt = (cents: number) => `R${(cents / 100).toFixed(2)}`;
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-ZA') : '—';

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Orders</h1>

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              tab === s ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm py-8 text-center">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Order', 'Buyer', 'Items', 'Total', 'Status', 'Delivery', 'Placed'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => navigate(`/admin/orders/${o.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">#{o.id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3 font-medium">{o.buyer?.businessName ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {o.items.map(i => `${i.quantityKg}kg`).join(', ')}
                  </td>
                  <td className="px-4 py-3 font-semibold">{fmt(o.totalAmountCents)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[o.status] ?? 'bg-gray-100'}`}>
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{fmtDate(o.deliveryDate)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString('en-ZA')}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No orders</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
