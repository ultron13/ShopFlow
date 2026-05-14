import { useState, useEffect } from 'react';
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

export function Listings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/listings').then(({ data }) => {
      setListings(data.listings);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading produce...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-6">Available Produce</h1>
      <div className="grid gap-4">
        {listings.map((l) => (
          <div key={l.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-lg">{l.product.replace('_', ' ')}</h2>
                <p className="text-sm text-gray-600">{l.cooperative.name} · {l.cooperative.city}</p>
                <p className="text-sm mt-1">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${l.grade === 'A' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    Grade {l.grade}
                  </span>
                  <span className="ml-2 text-gray-600">{l.quantityKg.toLocaleString()}kg available</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-700">R{(l.pricePerKgCents / 100).toFixed(2)}<span className="text-sm font-normal text-gray-500">/kg</span></p>
                <p className="text-xs text-gray-500">Delivered to Gauteng</p>
                <button className="mt-2 px-4 py-2 bg-green-700 text-white text-sm rounded hover:bg-green-800">
                  Place Order
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
