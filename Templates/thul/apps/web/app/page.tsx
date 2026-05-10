import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin, Users, Leaf } from 'lucide-react'
import { api } from '@/lib/trpc-server'
import { ProductCard } from '@/components/store/product-card'
import { formatPrice } from '@/lib/utils'

export const revalidate = 120

const categories = [
  { name: 'Fresh Vegetables', slug: 'vegetables', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600', color: 'from-green-600 to-emerald-700' },
  { name: 'Fresh Fruit', slug: 'fruit', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600', color: 'from-orange-400 to-amber-600' },
  { name: 'Herbs & Spices', slug: 'herbs-spices', image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600', color: 'from-lime-500 to-green-700' },
]

const perks = [
  { icon: MapPin, label: 'Local Vendors', desc: 'Direct from street markets near you' },
  { icon: Leaf, label: 'Farm Fresh', desc: 'Seasonal produce, picked this week' },
  { icon: Users, label: 'Stokvel Buying', desc: 'Pool orders with your community' },
]

export default async function HomePage() {
  const { products: featured } = await api.products.list.query({ featured: true, limit: 4 })

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-indigo-100">
              <MapPin className="h-3.5 w-3.5" /> Thohoyandou · Limpopo · All of SA
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Fresh from the<br />market stall,<br />straight to you.
            </h1>
            <p className="mt-6 text-lg text-indigo-200">
              Buy directly from SA street vendors — tomatoes, spinach, mangoes and more,
              at real market prices. Pay with PayFast, SnapScan, Ozow or cash on delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 shadow hover:bg-indigo-50"
              >
                Shop the Market <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/vendors"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10"
              >
                Find Vendors Near Me
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10"
              >
                🗺️ View on Map
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
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
            <h2 className="text-2xl font-bold text-gray-900">In Season Now</h2>
            <Link href="/seasonal" className="text-sm font-medium text-indigo-600 hover:underline">
              Full seasonal calendar →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={{ ...product, price: formatPrice(Number(product.price)), stock: product.stock } as Parameters<typeof ProductCard>[0]['product']} />
            ))}
          </div>
        </div>
      </section>

      {/* Stokvel CTA */}
      <section className="bg-indigo-700 py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold">Buying as a group?</h2>
            <p className="mt-2 text-indigo-200 max-w-lg">
              Start a Stokvel — pool contributions from family and neighbours, then place one big
              order together for better prices and shared delivery.
            </p>
          </div>
          <Link
            href="/stokvel"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Start a Stokvel <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-white py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Support your local vendor today.</h2>
        <p className="mt-3 text-gray-500">Fresh produce, fair prices, fast delivery across South Africa.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Browse the Market <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  )
}
