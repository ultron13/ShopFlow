import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin, Sprout, Users, CheckCircle, Store } from 'lucide-react'
import { api } from '@/lib/trpc-server'
import { ProductCard } from '@/components/store/product-card'
import { formatPrice } from '@/lib/utils'

export const revalidate = 120

const FARMER_CATEGORIES = [
  'Vegetable Farmer',
  'Fruit Farmer',
  'Organic Farmer',
  'Herb & Spice Farmer',
  'Urban Farmer',
]

const CATEGORY_ICONS: Record<string, string> = {
  'Vegetable Farmer':    '🥬',
  'Fruit Farmer':        '🍊',
  'Organic Farmer':      '🌱',
  'Herb & Spice Farmer': '🌿',
  'Urban Farmer':        '🏙️',
}

const categories = [
  {
    name: 'Fresh Vegetables',
    slug: 'vegetables',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600',
    color: 'from-green-600 to-emerald-700',
  },
  {
    name: 'Fresh Fruit',
    slug: 'fruit',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600',
    color: 'from-orange-400 to-amber-600',
  },
  {
    name: 'Herbs & Spices',
    slug: 'herbs-spices',
    image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600',
    color: 'from-lime-500 to-green-700',
  },
]

const steps = [
  {
    num: '1',
    title: 'Find a farmer or vendor',
    desc: 'Browse by province, category, or on the interactive map.',
  },
  {
    num: '2',
    title: 'Order on WhatsApp',
    desc: 'One tap opens a pre-filled message — agree on quantity and delivery.',
  },
  {
    num: '3',
    title: 'Receive fresh produce',
    desc: 'Delivery to your door or click-and-collect near you.',
  },
]

export default async function HomePage() {
  const [{ products: featured }, allVendors] = await Promise.all([
    api.products.list.query({ featured: true, limit: 4 }),
    api.vendors.list.query({}),
  ])

  const farmers = allVendors
    .filter((v) => FARMER_CATEGORIES.includes(v.category ?? ''))
    .slice(0, 4)

  const farmerCount = allVendors.filter((v) => FARMER_CATEGORIES.includes(v.category ?? '')).length
  const vendorCount = allVendors.filter((v) => !FARMER_CATEGORIES.includes(v.category ?? '')).length

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-700 via-green-800 to-indigo-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-green-100">
              <MapPin className="h-3.5 w-3.5" /> From Limpopo to the Cape — all 9 provinces
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Fresh from SA farmers<br />& street markets,<br />straight to you.
            </h1>
            <p className="mt-6 text-lg text-green-100">
              Order directly from verified South African farmers and street vendors —
              no middlemen, no markup. Pay with EFT, SnapScan, Ozow or cash on delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/farmers"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-green-700 shadow hover:bg-green-50"
              >
                <Sprout className="h-4 w-4" /> Browse Farmers
              </Link>
              <Link
                href="/vendors"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10"
              >
                <Store className="h-4 w-4" /> Browse Vendors
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
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 right-32 h-60 w-60 rounded-full bg-white/5" />
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x">
          <div className="flex items-center gap-3 px-6 py-5">
            <Sprout className="h-6 w-6 shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{farmerCount} Farmers</p>
              <p className="text-xs text-gray-500">Across all 9 provinces</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-5">
            <Store className="h-6 w-6 shrink-0 text-indigo-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{vendorCount} Vendors</p>
              <p className="text-xs text-gray-500">Street markets near you</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-5">
            <Users className="h-6 w-6 shrink-0 text-indigo-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Stokvel Buying</p>
              <p className="text-xs text-gray-500">Pool orders with your community</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured farmers ──────────────────────────────────────────────── */}
      {farmers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Meet Our Farmers</h2>
              <p className="mt-1 text-sm text-gray-500">
                Order directly from verified farmers across South Africa
              </p>
            </div>
            <Link
              href="/farmers"
              className="text-sm font-medium text-green-700 hover:underline flex items-center gap-1"
            >
              All {farmerCount} farmers <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {farmers.map((farmer) => (
              <div
                key={farmer.id}
                className="rounded-2xl border bg-white p-5 hover:border-green-300 hover:shadow-sm transition flex flex-col"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-1 flex-wrap">
                      <span className="truncate">{farmer.businessName}</span>
                      {farmer.isVerified && (
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      )}
                    </h3>
                    {farmer.category && (
                      <p className="mt-0.5 text-xs font-medium text-green-700">
                        {CATEGORY_ICONS[farmer.category]} {farmer.category}
                      </p>
                    )}
                  </div>
                </div>

                {farmer.description && (
                  <p className="mt-2 text-xs text-gray-500 line-clamp-2 flex-1">
                    {farmer.description}
                  </p>
                )}

                {(farmer.city || farmer.province) && (
                  <p className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {[farmer.city, farmer.province].filter(Boolean).join(', ')}
                  </p>
                )}

                <div className="mt-3 flex gap-2">
                  {farmer.whatsapp && (
                    <a
                      href={`https://wa.me/27${farmer.whatsapp.replace(/^0/, '')}?text=${encodeURIComponent(`Hi ${farmer.businessName}, I would like to place an order.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center rounded-lg bg-green-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      💬 Order
                    </a>
                  )}
                  <Link
                    href={`/farmers/${farmer.id}`}
                    className="flex-1 inline-flex items-center justify-center rounded-lg border border-green-200 px-2 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
                  >
                    Profile →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Shop by category ──────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
        </div>
      </section>

      {/* ── In season now ─────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">In Season Now</h2>
              <Link href="/seasonal" className="text-sm font-medium text-green-700 hover:underline">
                Full seasonal calendar →
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    price: formatPrice(Number(product.price)),
                    stock: product.stock,
                  } as Parameters<typeof ProductCard>[0]['product']}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How it works</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-xl font-bold text-white">
                  {step.num}
                </div>
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stokvel CTA ───────────────────────────────────────────────────── */}
      <section className="bg-indigo-700 py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold">Buying as a group?</h2>
            <p className="mt-2 text-indigo-200 max-w-lg">
              Start a Stokvel — pool contributions from family and neighbours,
              then place one big order together for better prices and shared delivery.
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

      {/* ── Register CTA ──────────────────────────────────────────────────── */}
      <section className="py-16 text-center bg-white">
        <h2 className="text-3xl font-bold text-gray-900">Are you a farmer or vendor?</h2>
        <p className="mt-3 text-gray-500 max-w-md mx-auto">
          List your farm or stall for free. Connect directly with buyers across South Africa — no commission, no agents.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/vendor/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-3 font-semibold text-white hover:bg-green-700"
          >
            <Sprout className="h-4 w-4" /> Register My Farm
          </Link>
          <Link
            href="/vendor/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 px-8 py-3 font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            <Store className="h-4 w-4" /> Register My Stall
          </Link>
        </div>
      </section>
    </div>
  )
}
