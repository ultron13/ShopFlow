import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';

interface Metrics {
  gmvCents: number;
  activeListings: number;
  pendingOrders: number;
  deliveriesToday: number;
  payoutsDue48h: number;
  openDisputes: number;
}

function MetricCard({ label, value, urgent }: { label: string; value: string | number; urgent?: boolean }) {
  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm border ${urgent ? 'border-red-300' : 'border-gray-200'}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${urgent ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    api.get('/admin/metrics').then(({ data }) => setMetrics(data));
    const interval = setInterval(() => {
      api.get('/admin/metrics').then(({ data }) => setMetrics(data));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-6">Operations Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <MetricCard label="Total GMV" value={`R${(metrics.gmvCents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 0 })}`} />
        <MetricCard label="Active Listings" value={metrics.activeListings} />
        <MetricCard label="Pending Orders" value={metrics.pendingOrders} />
        <MetricCard label="Deliveries Today" value={metrics.deliveriesToday} />
        <MetricCard label="Payouts Due (48h)" value={metrics.payoutsDue48h} urgent={metrics.payoutsDue48h > 0} />
        <MetricCard label="Open Disputes" value={metrics.openDisputes} urgent={metrics.openDisputes > 0} />
      </div>
      {metrics.payoutsDue48h > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
          <strong>{metrics.payoutsDue48h} payout(s)</strong> are due within 48 hours. Review the payment queue immediately.
        </div>
      )}
    </div>
  );
}
