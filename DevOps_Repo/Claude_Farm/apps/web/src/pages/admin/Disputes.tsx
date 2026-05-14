import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';

const STATUS_STYLE: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-500',
};

interface Dispute {
  id: string;
  reason: string;
  description: string;
  status: string;
  resolution: string | null;
  createdAt: string;
  order: {
    id: string;
    totalAmountCents: number;
    buyer: { businessName: string };
  };
}

export function AdminDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState('');
  const [resolveStatus, setResolveStatus] = useState<'RESOLVED' | 'CLOSED'>('RESOLVED');
  const [saving, setSaving] = useState(false);

  function load() {
    api.get('/disputes?limit=100').then(({ data }) => {
      setDisputes(data.disputes);
      setLoading(false);
    }).catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function resolve() {
    if (!selected) return;
    setSaving(true);
    await api.patch(`/disputes/${selected.id}/resolve`, { status: resolveStatus, resolution });
    setSaving(false);
    setSelected(null);
    setResolution('');
    load();
  }

  const open = disputes.filter(d => d.status === 'OPEN' || d.status === 'UNDER_REVIEW');
  const closed = disputes.filter(d => d.status === 'RESOLVED' || d.status === 'CLOSED');

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Disputes</h1>

      {loading ? (
        <p className="text-gray-400 text-sm py-8 text-center">Loading...</p>
      ) : disputes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No disputes</p>
          <p className="text-sm">Disputes raised by buyers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {open.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Open ({open.length})</h2>
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {['Order', 'Buyer', 'Reason', 'Amount', 'Status', 'Opened', ''].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {open.map((d) => (
                      <tr key={d.id} className="bg-red-50/40">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">#{d.order.id.slice(-8).toUpperCase()}</td>
                        <td className="px-4 py-3 font-medium">{d.order.buyer?.businessName}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-red-700">{d.reason.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">{d.description}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-700">R{(d.order.totalAmountCents / 100).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[d.status]}`}>{d.status.replace(/_/g, ' ')}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString('en-ZA')}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => { setSelected(d); setResolution(''); }}
                            className="px-3 py-1 bg-green-700 text-white text-xs rounded hover:bg-green-800"
                          >
                            Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {closed.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Resolved / Closed</h2>
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {['Order', 'Buyer', 'Reason', 'Amount', 'Status', 'Resolution'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {closed.map((d) => (
                      <tr key={d.id}>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">#{d.order.id.slice(-8).toUpperCase()}</td>
                        <td className="px-4 py-3 font-medium">{d.order.buyer?.businessName}</td>
                        <td className="px-4 py-3 text-gray-600">{d.reason.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3">R{(d.order.totalAmountCents / 100).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[d.status]}`}>{d.status}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{d.resolution ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="font-bold text-lg mb-1">Resolve Dispute</h2>
            <p className="text-sm text-gray-500 mb-4">Order #{selected.order.id.slice(-8).toUpperCase()} — {selected.order.buyer?.businessName}</p>

            <div className="bg-red-50 rounded p-3 mb-4 text-sm">
              <p className="font-medium text-red-700">{selected.reason.replace(/_/g, ' ')}</p>
              <p className="text-gray-600 mt-1">{selected.description}</p>
            </div>

            <label className="block text-sm font-medium mb-1">Outcome</label>
            <select
              value={resolveStatus}
              onChange={e => setResolveStatus(e.target.value as 'RESOLVED' | 'CLOSED')}
              className="w-full border rounded p-2 text-sm mb-3"
            >
              <option value="RESOLVED">Resolved (in buyer's favour)</option>
              <option value="CLOSED">Closed (rejected / no action)</option>
            </select>

            <label className="block text-sm font-medium mb-1">Resolution notes</label>
            <textarea
              rows={3}
              value={resolution}
              onChange={e => setResolution(e.target.value)}
              placeholder="Describe the action taken..."
              className="w-full border rounded p-2 text-sm mb-4 resize-none"
            />

            <div className="flex gap-2">
              <button onClick={() => setSelected(null)} className="flex-1 border rounded py-2 text-sm">Cancel</button>
              <button
                onClick={resolve}
                disabled={!resolution || saving}
                className="flex-1 bg-green-700 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
