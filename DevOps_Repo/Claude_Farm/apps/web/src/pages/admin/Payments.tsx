import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-600',
};

export function AdminPayments() {
  const [queue, setQueue] = useState<any[]>([]);
  const [all, setAll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'queue' | 'all'>('queue');

  function load() {
    Promise.all([
      api.get('/payments/queue'),
      api.get('/payments?limit=100'),
    ]).then(([q, a]) => {
      setQueue(q.data.pending);
      setAll(a.data.payments);
      setLoading(false);
    });
  }

  useEffect(() => { load(); }, []);

  const fmt = (cents: number) => `R${(cents / 100).toFixed(2)}`;
  const fmtDate = (d: string) => new Date(d).toLocaleString('en-ZA');

  const payments = tab === 'queue' ? queue : all;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Payments</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('queue')}
          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${tab === 'queue' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Payout Queue {queue.length > 0 && <span className="ml-1 bg-white text-red-600 rounded-full px-1.5 text-xs">{queue.length}</span>}
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${tab === 'all' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          All Payments
        </button>
      </div>

      {tab === 'queue' && queue.length === 0 && !loading && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No payouts due</p>
          <p className="text-sm">Farmer payouts are triggered automatically 48 hours after delivery confirmation.</p>
        </div>
      )}

      {loading ? <p className="text-gray-400 text-sm py-8 text-center">Loading...</p> : (
        <div className="bg-white border rounded-lg overflow-hidden">
          {payments.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Cooperative', 'Type', 'Amount', 'Status', tab === 'queue' ? 'Due' : 'Date', 'Reference'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((p: any) => (
                  <tr key={p.id} className={tab === 'queue' ? 'bg-red-50' : ''}>
                    <td className="px-4 py-3 font-medium">{p.cooperative?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.type?.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 font-bold text-green-700">{fmt(p.amountCents)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[p.status] ?? 'bg-gray-100'}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {tab === 'queue' && p.dueAt ? fmtDate(p.dueAt) : fmtDate(p.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.pspReference ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
