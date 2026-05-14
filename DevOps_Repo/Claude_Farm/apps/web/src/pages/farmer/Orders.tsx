import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';

const STATUS_STYLE: Record<string, string> = {
  CONFIRMED: 'bg-blue-100 text-blue-700',
  COLLECTION_SCHEDULED: 'bg-purple-100 text-purple-700',
  COLLECTED: 'bg-indigo-100 text-indigo-700',
  IN_TRANSIT: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700',
  DISPUTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-400',
};

const TABS = ['ALL', 'CONFIRMED', 'COLLECTION_SCHEDULED', 'IN_TRANSIT', 'DELIVERED'];

interface Order {
  id: string;
  status: string;
  createdAt: string;
  buyer: { businessName: string; deliveryCity: string };
  items: { quantityKg: number; subtotalCents: number; listing: { product: string; grade: string } | null }[];
  deliveryStop: {
    deliveredAt: string | null;
    delivery: { route: string; scheduledDate: string; status: string } | null;
  } | null;
}

export function FarmerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = tab !== 'ALL' ? `?status=${tab}&limit=100` : '?limit=100';
    api.get(`/farmer/orders${params}`).then(({ data }) => {
      setOrders(data.orders);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [tab]);

  const fmt = (cents: number) => `R${(cents / 100).toFixed(2)}`;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Orders for My Produce</h1>

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
        <p className="text-gray-400 text-sm py-8 text-center">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => {
            const subtotal = o.items.reduce((s, i) => s + i.subtotalCents, 0);
            const isExpanded = expanded === o.id;

            return (
              <div key={o.id} className="bg-white border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpanded(isExpanded ? null : o.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[o.status] ?? 'bg-gray-100'}`}>
                      {o.status.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-xs text-gray-400">#{o.id.slice(-8).toUpperCase()}</span>
                    <span className="font-medium text-sm">{o.buyer?.businessName}</span>
                    <span className="text-xs text-gray-400">{o.buyer?.deliveryCity}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-green-700 text-sm">{fmt(subtotal)}</span>
                    <span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('en-ZA')}</span>
                    <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t bg-gray-50 px-4 py-3 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</p>
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-200">
                          {o.items.map((item, i) => (
                            <tr key={i} className="bg-white">
                              <td className="py-2 pr-4 font-medium">
                                {item.listing?.product?.replace(/_/g, ' ') ?? '—'}
                                <span className="ml-2 bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs">Grade {item.listing?.grade}</span>
                              </td>
                              <td className="py-2 pr-4 text-gray-500">{item.quantityKg} kg</td>
                              <td className="py-2 font-medium text-green-700">{fmt(item.subtotalCents)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {o.deliveryStop?.delivery && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Delivery</p>
                        <p className="text-sm">
                          Route: <span className="font-medium">{o.deliveryStop.delivery.route}</span>
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${o.deliveryStop.delivery.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {o.deliveryStop.delivery.status}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Scheduled: {new Date(o.deliveryStop.delivery.scheduledDate).toLocaleDateString('en-ZA')}
                        </p>
                        {o.deliveryStop.deliveredAt && (
                          <p className="text-xs text-green-600 mt-0.5">
                            Delivered: {new Date(o.deliveryStop.deliveredAt).toLocaleString('en-ZA')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
