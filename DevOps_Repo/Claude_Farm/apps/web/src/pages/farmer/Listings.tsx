import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  DRAFT: 'bg-yellow-100 text-yellow-800',
  SOLD_OUT: 'bg-gray-100 text-gray-600',
  EXPIRED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-400',
};

const PRODUCTS = [
  'TOMATOES_ROMA', 'TOMATOES_CHERRY', 'TOMATOES_BEEFSTEAK',
  'PEPPERS_GREEN', 'PEPPERS_RED', 'ONIONS', 'POTATOES', 'CARROTS', 'CABBAGE', 'SPINACH',
];

interface Listing {
  id: string;
  product: string;
  grade: 'A' | 'B' | 'C';
  quantityKg: number;
  pricePerKgCents: number;
  status: string;
  availableFrom: string;
  availableUntil: string;
  description: string | null;
}

const blank = {
  product: 'TOMATOES_ROMA',
  grade: 'A' as const,
  quantityKg: '',
  pricePerKgCents: '',
  availableFrom: '',
  availableUntil: '',
  description: '',
};

export function FarmerListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ ...blank });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ quantityKg: string; pricePerKgCents: string; status: string }>({
    quantityKg: '', pricePerKgCents: '', status: '',
  });

  function load() {
    api.get('/farmer/listings').then(({ data }) => {
      setListings(data.listings);
      setIsVerified(data.isVerified);
      setLoading(false);
    }).catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function create() {
    setSaving(true);
    await api.post('/farmer/listings', {
      ...form,
      quantityKg: Number(form.quantityKg),
      pricePerKgCents: Math.round(Number(form.pricePerKgCents) * 100),
      availableFrom: new Date(form.availableFrom).toISOString(),
      availableUntil: new Date(form.availableUntil).toISOString(),
    });
    setSaving(false);
    setShowCreate(false);
    setForm({ ...blank });
    load();
  }

  async function saveEdit(id: string) {
    await api.patch(`/farmer/listings/${id}`, {
      quantityKg: Number(editForm.quantityKg),
      pricePerKgCents: Math.round(Number(editForm.pricePerKgCents) * 100),
      status: editForm.status,
    });
    setEditId(null);
    load();
  }

  function startEdit(l: Listing) {
    setEditId(l.id);
    setEditForm({
      quantityKg: String(l.quantityKg),
      pricePerKgCents: (l.pricePerKgCents / 100).toFixed(2),
      status: l.status,
    });
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">My Listings</h1>
        {isVerified ? (
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-green-700 text-white text-sm rounded hover:bg-green-800">
            + New listing
          </button>
        ) : (
          <span className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded">
            Awaiting cooperative verification
          </span>
        )}
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No listings yet</p>
          <p className="text-sm mt-1">{isVerified ? 'Create your first listing above.' : 'Listings will be available once your cooperative is verified.'}</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Product', 'Grade', 'Quantity', 'Price / kg', 'Available', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {listings.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3 font-medium">{l.product.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3">
                    <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs font-medium">Grade {l.grade}</span>
                  </td>
                  <td className="px-4 py-3">
                    {editId === l.id ? (
                      <input
                        type="number"
                        value={editForm.quantityKg}
                        onChange={e => setEditForm({ ...editForm, quantityKg: e.target.value })}
                        className="w-24 border rounded px-2 py-1 text-sm"
                      />
                    ) : (
                      `${l.quantityKg.toLocaleString()} kg`
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editId === l.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400 text-sm">R</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.pricePerKgCents}
                          onChange={e => setEditForm({ ...editForm, pricePerKgCents: e.target.value })}
                          className="w-20 border rounded px-2 py-1 text-sm"
                        />
                      </div>
                    ) : (
                      <span className="font-semibold text-green-700">R{(l.pricePerKgCents / 100).toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(l.availableFrom).toLocaleDateString('en-ZA')} –{' '}
                    {new Date(l.availableUntil).toLocaleDateString('en-ZA')}
                  </td>
                  <td className="px-4 py-3">
                    {editId === l.id ? (
                      <select
                        value={editForm.status}
                        onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        {['ACTIVE', 'DRAFT', 'SOLD_OUT', 'EXPIRED', 'CANCELLED'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[l.status] ?? 'bg-gray-100'}`}>
                        {l.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editId === l.id ? (
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(l.id)} className="text-xs px-2 py-1 bg-green-700 text-white rounded hover:bg-green-800">Save</button>
                        <button onClick={() => setEditId(null)} className="text-xs px-2 py-1 border rounded hover:bg-gray-50">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(l)} className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 border rounded hover:bg-gray-50">
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-lg mb-4">New Listing</h2>

            <label className="block text-sm font-medium mb-1">Product</label>
            <select
              value={form.product}
              onChange={e => setForm({ ...form, product: e.target.value })}
              className="w-full border rounded p-2 text-sm mb-3"
            >
              {PRODUCTS.map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
            </select>

            <label className="block text-sm font-medium mb-1">Grade</label>
            <select
              value={form.grade}
              onChange={e => setForm({ ...form, grade: e.target.value as 'A' | 'B' | 'C' })}
              className="w-full border rounded p-2 text-sm mb-3"
            >
              <option value="A">Grade A (premium)</option>
              <option value="B">Grade B (standard)</option>
              <option value="C">Grade C (processing)</option>
            </select>

            {[
              { label: 'Quantity (kg)', key: 'quantityKg', type: 'number', placeholder: '1000' },
              { label: 'Price per kg (R)', key: 'pricePerKgCents', type: 'number', placeholder: '5.50' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} className="mb-3">
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
            ))}

            <label className="block text-sm font-medium mb-1">Available from</label>
            <input type="date" value={form.availableFrom} onChange={e => setForm({ ...form, availableFrom: e.target.value })} className="w-full border rounded p-2 text-sm mb-3" />

            <label className="block text-sm font-medium mb-1">Available until</label>
            <input type="date" value={form.availableUntil} onChange={e => setForm({ ...form, availableUntil: e.target.value })} className="w-full border rounded p-2 text-sm mb-3" />

            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded p-2 text-sm mb-4 resize-none"
            />

            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 border rounded py-2 text-sm">Cancel</button>
              <button
                onClick={create}
                disabled={saving || !form.quantityKg || !form.pricePerKgCents || !form.availableFrom || !form.availableUntil}
                className="flex-1 bg-green-700 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
