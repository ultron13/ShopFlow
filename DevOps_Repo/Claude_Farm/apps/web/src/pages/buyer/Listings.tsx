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
  availableUntil: string;
  description: string | null;
  cooperative: { name: string; city: string; province: string };
}

interface CartItem {
  listing: Listing;
  qty: number;
}

const GRADE_STYLE = {
  A: 'bg-green-100 text-green-800',
  B: 'bg-yellow-100 text-yellow-800',
  C: 'bg-gray-100 text-gray-700',
};

const PRODUCTS = [
  'ALL',
  'TOMATOES_ROMA', 'TOMATOES_CHERRY', 'TOMATOES_BEEFSTEAK',
  'PEPPERS_GREEN', 'PEPPERS_RED', 'ONIONS', 'POTATOES', 'CARROTS', 'CABBAGE', 'SPINACH',
];

export function Listings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [productFilter, setProductFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (productFilter !== 'ALL') params.set('product', productFilter);
    if (gradeFilter !== 'ALL') params.set('grade', gradeFilter);
    api.get(`/listings?${params}`).then(({ data }) => {
      setListings(data.listings);
      setLoading(false);
    });
  }, [productFilter, gradeFilter]);

  function addToCart(listing: Listing) {
    setCart(prev => {
      const existing = prev.find(c => c.listing.id === listing.id);
      if (existing) return prev.map(c => c.listing.id === listing.id ? { ...c, qty: c.qty + 50 } : c);
      return [...prev, { listing, qty: 50 }];
    });
  }

  function updateQty(listingId: string, qty: number) {
    if (qty <= 0) {
      setCart(prev => prev.filter(c => c.listing.id !== listingId));
    } else {
      setCart(prev => prev.map(c => c.listing.id === listingId ? { ...c, qty } : c));
    }
  }

  async function placeOrder() {
    setPlacing(true);
    setError('');
    try {
      await api.post('/orders', {
        items: cart.map(c => ({ listingId: c.listing.id, quantityKg: c.qty })),
        ...(deliveryDate && { deliveryDate: new Date(deliveryDate).toISOString() }),
      });
      setCart([]);
      setShowCart(false);
      navigate('/buyer/orders');
    } catch (e: any) {
      setError(e.response?.data?.details?.reason ?? e.response?.data?.error ?? 'Order failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  const cartTotal = cart.reduce((s, c) => s + (c.qty * c.listing.pricePerKgCents) / 100, 0);

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Browse Produce</h1>
        {cart.length > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm rounded hover:bg-green-800"
          >
            Cart ({cart.length}) · R{cartTotal.toFixed(2)}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <select
          value={productFilter}
          onChange={e => setProductFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm bg-white"
        >
          {PRODUCTS.map(p => <option key={p} value={p}>{p === 'ALL' ? 'All products' : p.replace(/_/g, ' ')}</option>)}
        </select>
        <select
          value={gradeFilter}
          onChange={e => setGradeFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm bg-white"
        >
          <option value="ALL">All grades</option>
          <option value="A">Grade A (premium)</option>
          <option value="B">Grade B (standard)</option>
          <option value="C">Grade C (processing)</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading produce...</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="font-medium">No produce matching your filters</p>
          <p className="text-sm mt-1">Try adjusting your search above.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {listings.map((l) => {
            const inCart = cart.find(c => c.listing.id === l.id);
            return (
              <div key={l.id} className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-semibold">{l.product.replace(/_/g, ' ')}</h2>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${GRADE_STYLE[l.grade]}`}>Grade {l.grade}</span>
                    </div>
                    <p className="text-sm text-gray-500">{l.cooperative.name} · {l.cooperative.city}, {l.cooperative.province}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {l.quantityKg.toLocaleString()} kg available
                      <span className="mx-1.5 text-gray-300">·</span>
                      Until {new Date(l.availableUntil).toLocaleDateString('en-ZA')}
                    </p>
                    {l.description && <p className="text-xs text-gray-400 mt-1">{l.description}</p>}
                  </div>
                  <div className="text-right ml-6 shrink-0">
                    <p className="text-xl font-bold text-green-700">
                      R{(l.pricePerKgCents / 100).toFixed(2)}<span className="text-sm font-normal text-gray-400">/kg</span>
                    </p>
                    <p className="text-xs text-gray-400 mb-2">Delivered Gauteng</p>
                    {inCart ? (
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => updateQty(l.id, inCart.qty - 50)} className="w-7 h-7 border rounded text-gray-600 hover:bg-gray-50 text-sm">−</button>
                        <span className="text-sm w-14 text-center font-medium">{inCart.qty} kg</span>
                        <button onClick={() => updateQty(l.id, inCart.qty + 50)} className="w-7 h-7 border rounded text-gray-600 hover:bg-gray-50 text-sm">+</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(l)}
                        className="px-4 py-1.5 bg-green-700 text-white text-sm rounded hover:bg-green-800"
                      >
                        Add to order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cart / checkout modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-lg mb-4">Review Order</h2>

            <table className="w-full text-sm mb-4">
              <tbody className="divide-y">
                {cart.map(c => (
                  <tr key={c.listing.id}>
                    <td className="py-2 pr-3">
                      <p className="font-medium">{c.listing.product.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-400">{c.listing.cooperative.name} · Grade {c.listing.grade}</p>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQty(c.listing.id, c.qty - 50)} className="w-6 h-6 border rounded text-xs hover:bg-gray-50">−</button>
                        <span className="text-xs w-12 text-center">{c.qty} kg</span>
                        <button onClick={() => updateQty(c.listing.id, c.qty + 50)} className="w-6 h-6 border rounded text-xs hover:bg-gray-50">+</button>
                      </div>
                    </td>
                    <td className="py-2 text-right font-semibold text-green-700">
                      R{((c.qty * c.listing.pricePerKgCents) / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t">
                  <td colSpan={2} className="pt-2 font-semibold">Total</td>
                  <td className="pt-2 text-right font-bold text-green-700 text-base">R{cartTotal.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <label className="block text-sm font-medium mb-1">Requested delivery date (optional)</label>
            <input
              type="date"
              value={deliveryDate}
              onChange={e => setDeliveryDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border rounded p-2 text-sm mb-4"
            />

            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setShowCart(false)} className="flex-1 border rounded py-2 text-sm">Back</button>
              <button
                onClick={placeOrder}
                disabled={placing || cart.length === 0}
                className="flex-1 bg-green-700 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
              >
                {placing ? 'Placing…' : 'Confirm order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
