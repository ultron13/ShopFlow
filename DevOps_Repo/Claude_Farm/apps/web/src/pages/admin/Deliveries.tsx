import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';

const STATUS_STYLE: Record<string, string> = {
  PLANNED: 'bg-gray-100 text-gray-600',
  DISPATCHED: 'bg-orange-100 text-orange-700',
  IN_TRANSIT: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
};

interface Delivery {
  id: string;
  route: string;
  scheduledDate: string;
  transportProvider: string;
  driverName: string | null;
  driverPhone: string | null;
  status: string;
  dispatchedAt: string | null;
  stops: { id: string; stopSequence: number; deliveredAt: string | null; order: { id: string; totalAmountCents: number; buyer: { businessName: string } } }[];
}

export function AdminDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ route: '', scheduledDate: '', transportProvider: '', driverName: '', driverPhone: '' });
  const [showAddStop, setShowAddStop] = useState<string | null>(null);
  const [confirmedOrders, setConfirmedOrders] = useState<any[]>([]);
  const [stopOrderId, setStopOrderId] = useState('');

  function load() {
    api.get('/admin/deliveries').then(({ data }) => {
      setDeliveries(data.deliveries);
      setLoading(false);
    }).catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function createDelivery() {
    await api.post('/deliveries', {
      ...newForm,
      scheduledDate: new Date(newForm.scheduledDate).toISOString(),
    });
    setShowNew(false);
    setNewForm({ route: '', scheduledDate: '', transportProvider: '', driverName: '', driverPhone: '' });
    load();
  }

  async function dispatch(id: string) {
    await api.patch(`/deliveries/${id}/dispatch`);
    load();
  }

  async function confirmStop(deliveryId: string, stopId: string) {
    const signedOffBy = prompt('Signed off by (name):') ?? '';
    await api.patch(`/deliveries/${deliveryId}/stops/${stopId}/deliver`, { signedOffBy });
    load();
  }

  async function openAddStop(deliveryId: string) {
    setShowAddStop(deliveryId);
    const { data } = await api.get('/orders?status=CONFIRMED&limit=100');
    setConfirmedOrders(data.orders);
  }

  async function addStop(deliveryId: string, sequence: number) {
    await api.post(`/deliveries/${deliveryId}/stops`, {
      orderId: stopOrderId,
      stopSequence: sequence,
    });
    await api.patch(`/orders/${stopOrderId}/status`, { status: 'COLLECTION_SCHEDULED' });
    setShowAddStop(null);
    setStopOrderId('');
    load();
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Deliveries</h1>
        <button onClick={() => setShowNew(true)} className="px-4 py-2 bg-green-700 text-white text-sm rounded hover:bg-green-800">
          + New Run
        </button>
      </div>

      <div className="space-y-3">
        {deliveries.map((d) => (
          <div key={d.id} className="bg-white border rounded-lg overflow-hidden">
            {/* Run header */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
            >
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[d.status]}`}>{d.status}</span>
                <span className="font-medium">{d.route}</span>
                <span className="text-sm text-gray-500">{new Date(d.scheduledDate).toLocaleDateString('en-ZA')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{d.stops.length} stops</span>
                <span>{d.transportProvider}</span>
                {d.driverName && <span>{d.driverName} {d.driverPhone}</span>}
                <span className="text-gray-400">{expandedId === d.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {/* Expanded stops */}
            {expandedId === d.id && (
              <div className="border-t bg-gray-50">
                {d.stops.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-400">No stops yet — add an order below.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        {['#', 'Buyer', 'Order', 'Amount', 'Delivered'].map(h => (
                          <th key={h} className="px-4 py-2 text-left text-xs text-gray-500">{h}</th>
                        ))}
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[...d.stops].sort((a, b) => a.stopSequence - b.stopSequence).map((stop) => (
                        <tr key={stop.id} className="bg-white">
                          <td className="px-4 py-2 text-gray-400">{stop.stopSequence}</td>
                          <td className="px-4 py-2 font-medium">{stop.order.buyer?.businessName}</td>
                          <td className="px-4 py-2 font-mono text-xs text-gray-500">#{stop.order.id.slice(-8).toUpperCase()}</td>
                          <td className="px-4 py-2">R{(stop.order.totalAmountCents / 100).toFixed(2)}</td>
                          <td className="px-4 py-2">
                            {stop.deliveredAt
                              ? <span className="text-green-600 text-xs">{new Date(stop.deliveredAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}</span>
                              : <span className="text-gray-400 text-xs">Pending</span>
                            }
                          </td>
                          <td className="px-4 py-2">
                            {!stop.deliveredAt && d.status === 'DISPATCHED' && (
                              <button
                                onClick={() => confirmStop(d.id, stop.id)}
                                className="text-xs px-2 py-1 bg-green-700 text-white rounded hover:bg-green-800"
                              >
                                Confirm delivery
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Actions */}
                <div className="flex gap-2 p-3 border-t border-gray-200">
                  {d.status === 'PLANNED' && (
                    <>
                      <button
                        onClick={() => openAddStop(d.id)}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-white"
                      >
                        + Add stop
                      </button>
                      {d.stops.length > 0 && (
                        <button
                          onClick={() => dispatch(d.id)}
                          className="px-3 py-1.5 text-sm bg-green-700 text-white rounded hover:bg-green-800"
                        >
                          Dispatch
                        </button>
                      )}
                    </>
                  )}
                  {d.status === 'DISPATCHED' && d.stops.every(s => s.deliveredAt) && (
                    <p className="text-sm text-green-600 font-medium">All stops delivered ✓</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {deliveries.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p>No delivery runs yet.</p>
            <p className="text-sm">Create a run to start assigning confirmed orders.</p>
          </div>
        )}
      </div>

      {/* New delivery modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h2 className="font-bold text-lg mb-4">New Delivery Run</h2>
            {[
              { label: 'Route name', key: 'route', placeholder: 'N1-North-AM' },
              { label: 'Scheduled date', key: 'scheduledDate', placeholder: '', type: 'datetime-local' },
              { label: 'Transport provider', key: 'transportProvider', placeholder: 'Limpopo Cold Transport CC' },
              { label: 'Driver name', key: 'driverName', placeholder: 'Optional' },
              { label: 'Driver phone', key: 'driverPhone', placeholder: 'Optional' },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key} className="mb-3">
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input
                  type={type ?? 'text'}
                  placeholder={placeholder}
                  value={(newForm as any)[key]}
                  onChange={e => setNewForm({ ...newForm, [key]: e.target.value })}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowNew(false)} className="flex-1 border rounded py-2 text-sm">Cancel</button>
              <button
                onClick={createDelivery}
                disabled={!newForm.route || !newForm.scheduledDate || !newForm.transportProvider}
                className="flex-1 bg-green-700 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add stop modal */}
      {showAddStop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h2 className="font-bold text-lg mb-4">Add Stop</h2>
            <label className="block text-sm font-medium mb-1">Confirmed order</label>
            <select
              value={stopOrderId}
              onChange={e => setStopOrderId(e.target.value)}
              className="w-full border rounded p-2 text-sm mb-4"
            >
              <option value="">— Select order —</option>
              {confirmedOrders.map((o: any) => (
                <option key={o.id} value={o.id}>
                  #{o.id.slice(-8).toUpperCase()} — {o.buyer?.businessName} — R{(o.totalAmountCents / 100).toFixed(2)}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setShowAddStop(null)} className="flex-1 border rounded py-2 text-sm">Cancel</button>
              <button
                onClick={() => addStop(showAddStop, (deliveries.find(d => d.id === showAddStop)?.stops.length ?? 0) + 1)}
                disabled={!stopOrderId}
                className="flex-1 bg-green-700 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
