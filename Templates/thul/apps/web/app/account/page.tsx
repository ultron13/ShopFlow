import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@shopflow/db'
import Link from 'next/link'
import { User, Package, Heart, MapPin } from 'lucide-react'

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect('/sign-in')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { _count: { select: { orders: true, wishlist: true, addresses: true } } },
  })

  if (!user) redirect('/sign-in')

  const links = [
    { href: '/account/orders', icon: Package, label: 'Orders', count: user._count.orders },
    { href: '/account/wishlist', icon: Heart, label: 'Wishlist', count: user._count.wishlist },
    { href: '/account/addresses', icon: MapPin, label: 'Addresses', count: user._count.addresses },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">My Account</h1>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border bg-white p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <User className="h-7 w-7" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{user.name ?? 'Customer'}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">Member since {new Date(user.createdAt).getFullYear()}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {links.map(({ href, icon: Icon, label, count }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-xl border bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition"
          >
            <Icon className="h-6 w-6 text-indigo-500" />
            <div>
              <p className="font-semibold text-gray-900">{label}</p>
              <p className="text-sm text-gray-500">{count} item{count !== 1 ? 's' : ''}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
