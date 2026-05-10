import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@shopflow/db'
import { ProductCard } from '@/components/store/product-card'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default async function WishlistPage() {
  const session = await auth()
  if (!session?.user) redirect('/sign-in')

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { category: true, _count: { select: { reviews: true } } } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>

      {items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 text-gray-400">
          <Heart className="h-12 w-12 opacity-25" />
          <p>Your wishlist is empty</p>
          <Link href="/products" className="text-sm text-indigo-600 hover:underline">Browse products →</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ product }) => (
            <ProductCard key={product.id} product={{ ...product, price: Number(product.price) }} />
          ))}
        </div>
      )}
    </div>
  )
}
