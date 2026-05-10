import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { api } from '@/lib/trpc-server'
import { formatPrice } from '@/lib/utils'
import { TrendingUp, Users, Package, ShoppingBag, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') redirect('/')

  const data = await api.admin.dashboard.query()

  const stats = [
    { label: 'Total Revenue', value: formatPrice(data.totalRevenue), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Total Orders', value: data.totalOrders, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Customers', value: data.totalUsers, icon: Users, color: 'bg-purple-50 text-purple-600' },
    { label: 'Products', value: data.totalProducts, icon: Package, color: 'bg-indigo-50 text-indigo-600' },
  ]

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-3">
          <Link href="/admin/products" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Manage Products
          </Link>
          <Link href="/admin/orders" className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Manage Orders
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border bg-white p-5 flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-indigo-600 hover:underline">View all</Link>
          </div>
          <ul className="space-y-3">
            {data.recentOrders.map((order) => (
              <li key={order.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-mono font-medium">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400">{order.items.length} items</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status] ?? ''}`}>
                    {order.status}
                  </span>
                  <span className="font-semibold">{formatPrice(Number(order.total))}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <h2 className="font-semibold text-gray-900">Low Stock Alerts</h2>
          </div>
          {data.lowStock.length === 0 ? (
            <p className="text-sm text-gray-400">All products are well stocked.</p>
          ) : (
            <ul className="space-y-3">
              {data.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-800">{p.name}</span>
                  <span className={`font-semibold ${p.stock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
