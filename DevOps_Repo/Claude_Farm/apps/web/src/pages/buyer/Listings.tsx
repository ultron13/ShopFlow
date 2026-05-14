import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';

interface Listing {
  id: string;
  product: string;
  grade: 'A' | 'B' | 'C';
  quantityKg: number;
  pricePerKgCents: number;
  availableFrom: string;
  cooperative: { name: string; city: string; province: string };
}

interface OrderModal {
  listing: Listing;
  qty: number;
}

const GRADE_STYLE = { A: 'bg-green-100 text-green-800', B: 'bg-yellow-100 text-yellow-800', C: 'bg-gray-100 text-gray-700' };

export function Listings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<OrderModal | null>(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/listings').then(({ data }) => {
      setListings(data.listings);
      setLoading(false);
    });
  }, []);

  async function placeOrder() {
    if (!modal) return;
    setPlacing(true);
    setError('');
    try {
      await api.post('/orders', {
        items: [{ listingId: modal.listing.id, quantityKg: modal.qty }],
      });
      setModal(null);
      navigate('/orders');
    } catch (e: any) {
      setError(e.response?.data?.details?.reason ?? e.response?.data?.error ?? 'Order failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading produce...</div>;

  const total = modal ? (modal.qty * modal.listing.pricePerKgCents) / 100 : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-6">Available Produce</h1>

      <div className="grid gap-4">
        {listings.map((l) => (
          <div key={l.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-lg">{l.product.replace(/_/g, ' ')}</h2>
                <p className="text-sm text-gray-600">{l.cooperative.name} · {l.cooperative.city}, {l.cooperative.province}</p>
                <p className="text-sm mt-1 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${GRADE_STYLE[l.grade]}`}>Grade {l.grade}</span>
                  <span className="text-gray-600">{l.quantityKg.toLocaleString()} kg available</span>
                </p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-xl font-bold text-green-700">
                  R{(l.pricePerKgCents / 100).toFixed(2)}<span className="text-sm font-normal text-gray-500">/kg</span>
                </p>
                <p className="text-xs text-gray-500 mb-2">Delivered to Gauteng</p>
                <button
                  onClick={() => { setModal({ listing: l, qty: 50 }); setError(''); }}
                  className="px-4 py-2 bg-green-700 text-white text-sm rounded hover:bg-green-800 transition-colors"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        ))}
        {listings.length === 0 && (
          <p className="text-center text-gray-500 py-12">No produce available right now. Check back soon.</p>
        )}
      </div>

      {/* Order modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold mb-1">{modal.listing.product.replace(/_/g, ' ')}</h2>
            <p className="text-sm text-gray-500 mb-4">{modal.listing.cooperative.name} · Grade {modal.listing.grade}</p>

            <label className="block text-sm font-medium mb-1">Quantity (kg)</label>
            <input
              type="number"
              min={10}
              max={modal.listing.quantityKg}
              step={10}
              value={modal.qty}
              onChange={(e) => setModal({ ...modal, qty: Number(e.target.value) })}
              className="w-full border rounded p-2 text-sm mb-4"
            />

            <div className="bg-gray-50 rounded p-3 text-sm mb-4 space-y-1">
              <div className="flex justify-between"><span className="text-gray-600">Price per kg</span><span>R{(modal.listing.pricePerKgCents / 100).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Quantity</span><span>{modal.qty} kg</span></div>
              <div className="flex justify-between font-semibold border-t pt-1 mt-1"><span>Total</span><span>R{total.toFixed(2)}</span></div>
            </div>

            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 border border-gray-300 rounded py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={placeOrder}
                disabled={placing || modal.qty <= 0 || modal.qty > modal.listing.quantityKg}
                className="flex-1 bg-green-700 text-white rounded py-2 text-sm font-medium hover:bg-green-800 disabled:opacity-50 transition-colors"
              >
                {placing ? 'Placing...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
