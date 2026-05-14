import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';

const NEXT_STATUSES: Record<string, string[]> = {
  PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COLLECTION_SCHEDULED', 'CANCELLED'],
  COLLECTION_SCHEDULED: ['COLLECTED', 'CONFIRMED'],
  COLLECTED: ['IN_TRANSIT'],
  IN_TRANSIT: ['DELIVERED'],
  DELIVERED: [],
  DISPUTED: ['DELIVERED', 'CANCELLED'],
  CANCELLED: [],
};

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

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [agentId, setAgentId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => { setOrder(data.order); setLoading(false); });
    api.get('/admin/users?limit=100').then(({ data }) =>
      setAgents(data.users.filter((u: any) => u.role === 'FIELD_AGENT'))
    ).catch(() => {});
  }, [id]);

  async function updateStatus(status: string) {
    setUpdating(true);
    await api.patch(`/orders/${id}/status`, { status });
    setOrder({ ...order, status });
    setUpdating(false);
  }

  async function scheduleCollection() {
    await api.post('/collections', {
      cooperativeId: order.items[0]?.listing?.cooperative?.id,
      fieldAgentId: agentId || undefined,
      scheduledAt: new Date(scheduledAt).toISOString(),
    });
    await updateStatus('COLLECTION_SCHEDULED');
    setShowCollectionModal(false);
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (!order) return <div className="p-8 text-center text-gray-400">Order not found</div>;

  const nextStatuses = NEXT_STATUSES[order.status] ?? [];

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={() => navigate('/admin/orders')} className="text-sm text-gray-500 hover:text-gray-700 mb-1">← Orders</button>
          <h1 className="text-xl font-bold">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500">Placed {new Date(order.createdAt).toLocaleString('en-ZA')}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLE[order.status]}`}>
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Buyer */}
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Buyer</p>
          <p className="font-medium">{order.buyer?.businessName}</p>
          <p className="text-sm text-gray-500">{order.buyer?.deliveryAddress}</p>
          <p className="text-sm text-gray-500">{order.buyer?.deliveryCity}</p>
          {order.deliveryDate && (
            <p className="text-sm mt-2 text-green-700 font-medium">
              Delivery: {new Date(order.deliveryDate).toLocaleDateString('en-ZA')}
            </p>
          )}
        </div>

        {/* Financial */}
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Financials</p>
          <p className="text-2xl font-bold text-green-700">R{(order.totalAmountCents / 100).toFixed(2)}</p>
          {order.payments?.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Payment: <span className={order.payments[0].status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}>{order.payments[0].status}</span>
            </p>
          )}
          {order.invoice && (
            <p className="text-sm text-blue-600 mt-1 cursor-pointer">View invoice</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white border rounded-lg mb-4">
        <div className="px-4 py-3 border-b">
          <p className="text-xs font-semibold text-gray-500 uppercase">Order Items</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Product', 'Cooperative', 'Grade', 'Qty', 'Price/kg', 'Subtotal'].map(h => (
                <th key={h} className="px-4 py-2 text-left text-xs text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.items?.map((item: any) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{item.listing?.product?.replace(/_/g, ' ') ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{item.listing?.cooperative?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs">Grade {item.listing?.grade}</span>
                </td>
                <td className="px-4 py-3">{item.quantityKg} kg</td>
                <td className="px-4 py-3">R{(item.pricePerKgCents / 100).toFixed(2)}</td>
                <td className="px-4 py-3 font-medium">R{(item.subtotalCents / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delivery */}
      {order.deliveryStop && (
        <div className="bg-white border rounded-lg p-4 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Delivery</p>
          <p className="text-sm">Route: <span className="font-medium">{order.deliveryStop.delivery?.route}</span></p>
          <p className="text-sm text-gray-500">Driver: {order.deliveryStop.delivery?.driverName ?? 'Not assigned'}</p>
          <p className="text-sm text-gray-500">Status: {order.deliveryStop.delivery?.status}</p>
          {order.deliveryStop.deliveredAt && (
            <p className="text-sm text-green-600 mt-1">Delivered: {new Date(order.deliveryStop.deliveredAt).toLocaleString('en-ZA')}</p>
          )}
        </div>
      )}

      {/* Dispute */}
      {order.dispute && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-xs font-semibold text-red-600 uppercase mb-1">Dispute — {order.dispute.status}</p>
          <p className="text-sm font-medium">{order.dispute.reason}</p>
          <p className="text-sm text-gray-600">{order.dispute.description}</p>
        </div>
      )}

      {/* Actions */}
      {nextStatuses.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {nextStatuses.map((s) => (
            <button
              key={s}
              onClick={() => s === 'COLLECTION_SCHEDULED' ? setShowCollectionModal(true) : updateStatus(s)}
              disabled={updating}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 ${
                s === 'CANCELLED'
                  ? 'border border-red-300 text-red-600 hover:bg-red-50'
                  : 'bg-green-700 text-white hover:bg-green-800'
              }`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      )}

      {/* Schedule collection modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h2 className="font-bold text-lg mb-4">Schedule Collection</h2>
            <label className="block text-sm font-medium mb-1">Pickup date & time</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              className="w-full border rounded p-2 text-sm mb-4"
            />
            {agents.length > 0 && (
              <>
                <label className="block text-sm font-medium mb-1">Field agent (optional)</label>
                <select value={agentId} onChange={e => setAgentId(e.target.value)} className="w-full border rounded p-2 text-sm mb-4">
                  <option value="">— Assign later —</option>
                  {agents.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </>
            )}
            <div className="flex gap-2">
              <button onClick={() => setShowCollectionModal(false)} className="flex-1 border rounded py-2 text-sm">Cancel</button>
              <button onClick={scheduleCollection} disabled={!scheduledAt} className="flex-1 bg-green-700 text-white rounded py-2 text-sm font-medium disabled:opacity-50">
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
