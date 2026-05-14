import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';

interface Listing {
  id: string;
  product: string;
  grade: 'A' | 'B' | 'C';
  quantityKg: number;
  pricePerKgCents: number;
  status: string;
  availableFrom: string;
  availableUntil: string;
}

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  SOLD_OUT: 'bg-gray-100 text-gray-600',
  EXPIRED: 'bg-red-100 text-red-700',
  DRAFT: 'bg-yellow-100 text-yellow-800',
};

export function FarmerDashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/listings').then(({ data }) => {
      setListings(data.listings);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-2">My Listings</h1>
      <p className="text-sm text-gray-500 mb-6">
        Contact your FarmConnect field agent to add or update listings.
      </p>

      {listings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No active listings</p>
          <p className="text-sm mt-1">Your field agent will create listings once produce is graded.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold">{l.product.replace(/_/g, ' ')}</h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Grade {l.grade} · {l.quantityKg.toLocaleString()} kg
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Available {new Date(l.availableFrom).toLocaleDateString('en-ZA')} –{' '}
                    {new Date(l.availableUntil).toLocaleDateString('en-ZA')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-700">
                    R{(l.pricePerKgCents / 100).toFixed(2)}/kg
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block font-medium ${STATUS_STYLE[l.status] ?? 'bg-gray-100'}`}>
                    {l.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
