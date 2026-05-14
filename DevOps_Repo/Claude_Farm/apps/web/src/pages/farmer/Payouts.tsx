import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};

interface Payout {
  id: string;
  amountCents: number;
  status: string;
  dueAt: string | null;
  processedAt: string | null;
  pspReference: string | null;
  createdAt: string;
  order: { id: string } | null;
}

export function FarmerPayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/farmer/payouts?limit=100').then(({ data }) => {
      setPayouts(data.payouts);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const fmt = (cents: number) => `R${(cents / 100).toFixed(2)}`;
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-ZA') : '—';

  const totalPaid = payouts
    .filter(p => p.status === 'COMPLETED')
    .reduce((s, p) => s + p.amountCents, 0);

  const totalPending = payouts
    .filter(p => p.status === 'PENDING' || p.status === 'PROCESSING')
    .reduce((s, p) => s + p.amountCents, 0);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Payouts</h1>

      <div className="grid grid-cols-2 gap-4 mb-6 max-w-sm">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Total paid</p>
          <p className="text-xl font-bold text-green-700">{fmt(totalPaid)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Pending</p>
          <p className="text-xl font-bold text-yellow-600">{fmt(totalPending)}</p>
        </div>
      </div>

      {payouts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No payouts yet</p>
          <p className="text-sm mt-1">Payouts are triggered 48 hours after delivery confirmation.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Order', 'Amount', 'Status', 'Due', 'Paid', 'Reference'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {payouts.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    {p.order ? `#${p.order.id.slice(-8).toUpperCase()}` : '—'}
                  </td>
                  <td className="px-4 py-3 font-bold text-green-700">{fmt(p.amountCents)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[p.status] ?? 'bg-gray-100'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{fmtDate(p.dueAt)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{fmtDate(p.processedAt)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.pspReference ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
