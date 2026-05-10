import { Suspense } from 'react'
import Link from 'next/link'
import { MapPin, Phone, CheckCircle, Sprout, Award } from 'lucide-react'
import { api } from '@/lib/trpc-server'
import { FarmerFilters } from './farmer-filters'

export const revalidate = 60

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

export default async function FarmersPage({
  searchParams,
}: {
  searchParams: Promise<{ province?: string; category?: string; search?: string }>
}) {
  const params = await searchParams
  const province = params.province && params.province !== 'All' ? params.province : undefined
  const category = params.category && params.category !== 'All' ? params.category : undefined

  // Fetch all farmer categories
  const allFarmers = await api.vendors.list.query({ province })

  // Filter to only farmer categories (not street vendors)
  const farmers = allFarmers.filter((v) => FARMER_CATEGORIES.includes(v.category ?? ''))

  const filtered = farmers
    .filter((f) => !category || f.category === category)
    .filter(
      (f) =>
        !params.search ||
        f.businessName.toLowerCase().includes(params.search.toLowerCase()) ||
        f.city?.toLowerCase().includes(params.search.toLowerCase()) ||
        f.description?.toLowerCase().includes(params.search.toLowerCase())
    )

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <Sprout className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Find Farmers</h1>
      </div>
      <p className="mb-2 text-sm text-gray-500">
        Order directly from {farmers.length} South African farmers — fresh from the field, no middleman.
      </p>

      {/* Category quick-filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FARMER_CATEGORIES.map((cat) => {
          const active = params.category === cat
          const href = active ? '/farmers' : `/farmers?category=${encodeURIComponent(cat)}`
          return (
            <Link
              key={cat}
              href={href}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                active
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-green-800 hover:bg-green-100'
              }`}
            >
              {CATEGORY_ICONS[cat]} {cat}
            </Link>
          )
        })}
      </div>

      {/* Search + province filter */}
      <Suspense fallback={null}>
        <FarmerFilters
          province={params.province ?? 'All'}
          search={params.search ?? ''}
        />
      </Suspense>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-gray-50 py-20 text-center text-gray-400">
          <p className="text-3xl mb-2">🌾</p>
          <p className="font-medium">No farmers found</p>
          <p className="text-sm mt-1">Try a different province or search term</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((farmer) => (
            <div
              key={farmer.id}
              className="rounded-xl border bg-white p-5 hover:border-green-300 hover:shadow-sm transition flex flex-col"
            >
              {/* Name + badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={`/farmers/${farmer.id}`}>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-1 flex-wrap hover:text-green-700">
                      <span className="truncate">{farmer.businessName}</span>
                      {farmer.isVerified && (
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" title="Verified farmer" />
                      )}
                    </h3>
                  </Link>
                  {farmer.category && (
                    <p className="mt-0.5 text-xs font-medium text-green-700">
                      {CATEGORY_ICONS[farmer.category]} {farmer.category}
                    </p>
                  )}
                </div>
                {farmer.vatNumber && (
                  <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 flex items-center gap-0.5">
                    <Award className="h-3 w-3" /> VAT
                  </span>
                )}
              </div>

              {/* Description */}
              {farmer.description && (
                <p className="mt-2 text-xs text-gray-500 line-clamp-3 flex-1">{farmer.description}</p>
              )}

              {/* Location + contact */}
              <div className="mt-3 space-y-1">
                {(farmer.city || farmer.province) && (
                  <p className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {[farmer.city, farmer.province].filter(Boolean).join(', ')}
                  </p>
                )}
                {farmer.phone && (
                  <p className="flex items-center gap-1 text-xs text-gray-400">
                    <Phone className="h-3 w-3 shrink-0" />
                    {farmer.phone}
                  </p>
                )}
              </div>

              {/* Permit */}
              {farmer.permitNumber && (
                <span className="mt-2 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700 inline-block self-start">
                  ✓ Permit {farmer.permitNumber}
                </span>
              )}

              {/* CTAs */}
              <div className="mt-3 flex gap-2 flex-wrap">
                {farmer.whatsapp && (
                  <a
                    href={`https://wa.me/27${farmer.whatsapp.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                  >
                    💬 WhatsApp to Order
                  </a>
                )}
                <Link
                  href={`/farmers/${farmer.id}`}
                  className="inline-flex items-center justify-center rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
                >
                  View Profile →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register CTA */}
      <div className="mt-10 rounded-xl border bg-green-50 p-5 text-center">
        <p className="font-semibold text-green-900">Are you a farmer?</p>
        <p className="text-sm text-green-700 mt-1">
          List your farm to connect directly with buyers across South Africa — no agents, no commission.
        </p>
        <Link
          href="/vendor/dashboard"
          className="mt-3 inline-block rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
        >
          Register My Farm
        </Link>
      </div>
    </div>
  )
}
