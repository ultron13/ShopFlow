import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { api } from '@/lib/trpc-server'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  REFUNDED: 'bg-red-100 text-red-700',
}

export default async function AdminOrdersPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') redirect('/')

  const searchParams = await searchParamsPromise
  const page = Number(searchParams.page ?? '1')
  const { orders, total, pages } = await api.admin.ordersList.query({
    page,
    status: searchParams.status as Parameters<typeof api.admin.ordersList.query>[0]['status'],
  })

  const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total</p>
        </div>
      </div>

      {/* Status filters */}
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/admin/orders" className={`rounded-full px-3 py-1 text-xs font-medium ${!searchParams.status ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All
        </Link>
        {statuses.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${searchParams.status === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s}
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Order</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Items</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Total</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-medium text-gray-800">
                  #{order.id.slice(-8).toUpperCase()}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {order.user?.email ?? order.guestEmail ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3 text-gray-600">{order.items.length}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(Number(order.total))}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status] ?? ''}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link key={p}
              href={`/admin/orders?page=${p}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${p === page ? 'bg-indigo-600 text-white' : 'border text-gray-600 hover:bg-gray-50'}`}>
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
