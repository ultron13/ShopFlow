import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@shopflow/db'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'
import { Package } from 'lucide-react'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  REFUNDED: 'bg-red-100 text-red-700',
}

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user) redirect('/sign-in')

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Order History</h1>

      {orders.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 text-gray-400">
          <Package className="h-12 w-12 opacity-25" />
          <p>No orders yet</p>
          <Link href="/products" className="text-sm text-indigo-600 hover:underline">Start shopping →</Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-xl border bg-white p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-sm font-medium text-gray-700">
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] ?? ''}`}>
                  {order.status}
                </span>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''} ·{' '}
                <span className="font-semibold text-gray-900">{formatPrice(Number(order.total))}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
