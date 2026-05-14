import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_TRANSIT: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  DISPUTED: 'bg-red-100 text-red-800',
};

export function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(({ data }) => {
      setOrders(data.orders);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading orders...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-6">My Orders</h1>
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm text-gray-500">#{order.id.slice(-8).toUpperCase()}</p>
                <p className="font-semibold">R{(order.totalAmountCents / 100).toFixed(2)}</p>
                {order.deliveryDate && (
                  <p className="text-sm text-gray-600">Delivery: {new Date(order.deliveryDate).toLocaleDateString('en-ZA')}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-800'}`}>
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-center text-gray-500 py-8">No orders yet. Browse produce to place your first order.</p>
        )}
      </div>
    </div>
  );
}
