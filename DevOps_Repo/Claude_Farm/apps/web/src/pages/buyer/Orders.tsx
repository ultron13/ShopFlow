import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';

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

const TABS = ['ALL', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'DISPUTED'];

interface Order {
  id: string;
  status: string;
  totalAmountCents: number;
  deliveryDate: string | null;
  createdAt: string;
  items: { quantityKg: number; subtotalCents: number; listing: { product: string; grade: string } | null }[];
}

export function Orders() {
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
    }).catch(() => setLoading(false));
  }, [tab]);

  const fmt = (cents: number) => `R${(cents / 100).toFixed(2)}`;

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-bold text-gray-900 mb-4">My Orders</h1>

      <div className="flex gap-1 mb-4 flex-wrap">
        {TABS.map((s) => (
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
        <p className="text-center text-gray-400 py-8">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">No orders found</p>
          {tab === 'ALL' && (
            <button onClick={() => navigate('/buyer/listings')} className="mt-3 text-sm text-green-700 hover:underline">
              Browse produce to place your first order
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <div
              key={o.id}
              onClick={() => navigate(`/buyer/orders/${o.id}`)}
              className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-400">#{o.id.slice(-8).toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[o.status] ?? 'bg-gray-100'}`}>
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {o.items.map(i => `${i.quantityKg}kg ${i.listing?.product?.replace(/_/g, ' ') ?? ''}`).join(' + ')}
                  </p>
                  {o.deliveryDate && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Delivery: {new Date(o.deliveryDate).toLocaleDateString('en-ZA')}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="font-bold text-green-700">{fmt(o.totalAmountCents)}</p>
                  <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('en-ZA')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
