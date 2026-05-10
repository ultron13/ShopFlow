import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react'
import { api } from '@/lib/trpc-server'
import { ProductCard } from '@/components/store/product-card'
import { formatPrice } from '@/lib/utils'

export const revalidate = 120

const categories = [
  { name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600', color: 'from-blue-500 to-indigo-600' },
  { name: 'Clothing', slug: 'clothing', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600', color: 'from-pink-400 to-rose-600' },
  { name: 'Home & Kitchen', slug: 'home-kitchen', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', color: 'from-amber-400 to-orange-500' },
]

const perks = [
  { icon: Truck, label: 'Free Shipping', desc: 'On orders over $50' },
  { icon: RefreshCw, label: 'Free Returns', desc: '30-day hassle-free returns' },
  { icon: ShieldCheck, label: 'Secure Checkout', desc: 'Stripe-powered payments' },
]

export default async function HomePage() {
  const { products: featured } = await api.products.list.query({ featured: true, limit: 4 })

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Shop smarter.<br />Live better.
            </h1>
            <p className="mt-6 text-lg text-indigo-200">
              Curated products across electronics, clothing, and home essentials — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 shadow hover:bg-indigo-50"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products?featured=true"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10"
              >
                View Featured
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 right-32 h-60 w-60 rounded-full bg-white/5" />
      </section>

      {/* Perks bar */}
      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {perks.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3 px-6 py-5">
              <Icon className="h-6 w-6 flex-none text-indigo-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?categorySlug=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-60`} />
              </div>
              <div className="absolute bottom-0 left-0 p-5 text-white">
                <p className="text-lg font-bold">{cat.name}</p>
                <p className="text-sm text-white/80">Shop now →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link href="/products?featured=true" className="text-sm font-medium text-indigo-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={{ ...product, price: formatPrice(Number(product.price)), stock: product.stock } as Parameters<typeof ProductCard>[0]['product']} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Ready to explore?</h2>
        <p className="mt-3 text-gray-500">Browse our full catalog of premium products.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Browse All Products <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  )
}
