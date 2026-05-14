import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const TIMELINE = [
  { status: 'CONFIRMED', label: 'Order confirmed' },
  { status: 'COLLECTION_SCHEDULED', label: 'Collection scheduled' },
  { status: 'COLLECTED', label: 'Collected from farm' },
  { status: 'IN_TRANSIT', label: 'In transit' },
  { status: 'DELIVERED', label: 'Delivered' },
];

const STATUS_ORDER = ['CONFIRMED', 'COLLECTION_SCHEDULED', 'COLLECTED', 'IN_TRANSIT', 'DELIVERED'];

const DISPUTE_REASONS = ['QUALITY', 'QUANTITY', 'NOT_DELIVERED', 'WRONG_PRODUCT', 'OTHER'];

export function BuyerOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState('QUALITY');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [disputeError, setDisputeError] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => {
      setOrder(data.order);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  async function raiseDispute() {
    setSubmitting(true);
    setDisputeError('');
    try {
      await api.post('/disputes', { orderId: id, reason: disputeReason, description: disputeDesc });
      setShowDispute(false);
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.order);
    } catch (e: any) {
      setDisputeError(e.response?.data?.details?.reason ?? e.response?.data?.error ?? 'Could not raise dispute.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (!order) return <div className="p-8 text-center text-gray-400">Order not found</div>;

  const currentStep = STATUS_ORDER.indexOf(order.status);
  const canDispute = order.status === 'DELIVERED' && !order.dispute;
  const deliveredAt = order.deliveryStop?.deliveredAt;
  const hoursElapsed = deliveredAt ? (Date.now() - new Date(deliveredAt).getTime()) / 3_600_000 : 999;
  const disputeWindowOpen = canDispute && hoursElapsed <= 24;

  return (
    <div className="p-6 max-w-3xl">
      <button onClick={() => navigate('/buyer/orders')} className="text-sm text-gray-500 hover:text-gray-700 mb-4 block">
        ← My Orders
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500">Placed {new Date(order.createdAt).toLocaleString('en-ZA')}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLE[order.status]}`}>
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Delivery timeline */}
      {order.status !== 'CANCELLED' && order.status !== 'PENDING_PAYMENT' && (
        <div className="bg-white border rounded-lg p-4 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Delivery progress</p>
          <div className="flex items-center gap-0">
            {TIMELINE.map((step, i) => {
              const done = STATUS_ORDER.indexOf(step.status) <= currentStep;
              const active = step.status === order.status;
              return (
                <div key={step.status} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      done ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
                    } ${active ? 'ring-2 ring-green-400 ring-offset-1' : ''}`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <p className={`text-xs mt-1 text-center w-20 ${done ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-5 ${STATUS_ORDER.indexOf(step.status) < currentStep ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
          {order.deliveryStop?.deliveredAt && (
            <p className="text-xs text-green-600 mt-2 text-center font-medium">
              Delivered {new Date(order.deliveryStop.deliveredAt).toLocaleString('en-ZA')}
            </p>
          )}
        </div>
      )}

      {/* Items */}
      <div className="bg-white border rounded-lg mb-4 overflow-hidden">
        <div className="px-4 py-3 border-b">
          <p className="text-xs font-semibold text-gray-500 uppercase">Items</p>
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
                <td className="px-4 py-3 font-medium">{item.listing?.product?.replace(/_/g, ' ') ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{item.listing?.cooperative?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs">Grade {item.listing?.grade}</span>
                </td>
                <td className="px-4 py-3">{item.quantityKg} kg</td>
                <td className="px-4 py-3 text-gray-500">R{(item.pricePerKgCents / 100).toFixed(2)}</td>
                <td className="px-4 py-3 font-medium">R{(item.subtotalCents / 100).toFixed(2)}</td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td colSpan={5} className="px-4 py-2 text-right font-semibold text-sm">Total</td>
              <td className="px-4 py-2 font-bold text-green-700">R{(order.totalAmountCents / 100).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Delivery info */}
      {order.deliveryStop?.delivery && (
        <div className="bg-white border rounded-lg p-4 mb-4 text-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Delivery details</p>
          <p>Route: <span className="font-medium">{order.deliveryStop.delivery.route}</span></p>
          {order.deliveryDate && (
            <p className="text-gray-500">Requested date: {new Date(order.deliveryDate).toLocaleDateString('en-ZA')}</p>
          )}
          {order.deliveryStop.delivery.driverName && (
            <p className="text-gray-500">Driver: {order.deliveryStop.delivery.driverName}</p>
          )}
        </div>
      )}

      {/* Existing dispute */}
      {order.dispute && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-xs font-semibold text-red-600 uppercase mb-1">Dispute — {order.dispute.status.replace(/_/g, ' ')}</p>
          <p className="text-sm font-medium">{order.dispute.reason.replace(/_/g, ' ')}</p>
          <p className="text-sm text-gray-600">{order.dispute.description}</p>
          {order.dispute.resolution && (
            <p className="text-sm text-green-700 mt-2 font-medium">Resolution: {order.dispute.resolution}</p>
          )}
        </div>
      )}

      {/* Raise dispute CTA */}
      {canDispute && (
        <div className={`border rounded-lg p-4 ${disputeWindowOpen ? 'bg-white' : 'bg-gray-50'}`}>
          {disputeWindowOpen ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Issue with this delivery?</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Dispute window closes {Math.ceil(24 - hoursElapsed)}h from now.
                </p>
              </div>
              <button onClick={() => setShowDispute(true)} className="px-4 py-2 border border-red-300 text-red-600 text-sm rounded hover:bg-red-50">
                Raise dispute
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center">The 24-hour dispute window has closed for this order.</p>
          )}
        </div>
      )}

      {/* Dispute modal */}
      {showDispute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h2 className="font-bold text-lg mb-4">Raise a Dispute</h2>

            <label className="block text-sm font-medium mb-1">Reason</label>
            <select
              value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)}
              className="w-full border rounded p-2 text-sm mb-3"
            >
              {DISPUTE_REASONS.map(r => (
                <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
              ))}
            </select>

            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              rows={4}
              value={disputeDesc}
              onChange={e => setDisputeDesc(e.target.value)}
              placeholder="Describe the issue in detail (min 10 characters)"
              className="w-full border rounded p-2 text-sm mb-4 resize-none"
            />

            {disputeError && <p className="text-red-600 text-sm mb-3">{disputeError}</p>}

            <div className="flex gap-2">
              <button onClick={() => setShowDispute(false)} className="flex-1 border rounded py-2 text-sm">Cancel</button>
              <button
                onClick={raiseDispute}
                disabled={submitting || disputeDesc.length < 10}
                className="flex-1 bg-red-600 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
