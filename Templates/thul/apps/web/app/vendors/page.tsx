import { Suspense } from 'react'
import Link from 'next/link'
import { MapPin, Phone, CheckCircle } from 'lucide-react'
import { api } from '@/lib/trpc-server'
import { VendorFilters } from './vendor-filters'

export const revalidate = 60

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ province?: string; category?: string; search?: string }>
}) {
  const params = await searchParams
  const province = params.province && params.province !== 'All' ? params.province : undefined
  const category = params.category && params.category !== 'All' ? params.category : undefined

  const vendors = await api.vendors.list.query({ province, category })

  const filtered = params.search
    ? vendors.filter(
        (v) =>
          v.businessName.toLowerCase().includes(params.search!.toLowerCase()) ||
          v.city?.toLowerCase().includes(params.search!.toLowerCase())
      )
    : vendors

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Find Vendors Near You</h1>
        <p className="mt-1 text-sm text-gray-500">
          {vendors.length} street vendors selling fresh produce across South Africa
        </p>
      </div>

      {/* Client-side filters — province/category update URL params, search filters client-side */}
      <Suspense fallback={null}>
        <VendorFilters
          province={params.province ?? 'All'}
          category={params.category ?? 'All'}
          search={params.search ?? ''}
        />
      </Suspense>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-gray-50 py-20 text-center text-gray-400">
          <p className="text-3xl mb-2">🏪</p>
          <p className="font-medium">No vendors found</p>
          <p className="text-sm mt-1">
            Try adjusting your filters or{' '}
            <Link href="/vendor/dashboard" className="text-indigo-600 underline">
              register as a vendor
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/vendor/${vendor.id}`}
              className="block rounded-xl border bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-1 flex-wrap">
                    <span className="truncate">{vendor.businessName}</span>
                    {vendor.isVerified && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
                  </h3>
                  {vendor.category && (
                    <p className="text-xs text-indigo-600 mt-0.5">{vendor.category}</p>
                  )}
                </div>
              </div>

              {vendor.description && (
                <p className="mt-2 text-xs text-gray-500 line-clamp-2">{vendor.description}</p>
              )}

              <div className="mt-3 space-y-1">
                {(vendor.city || vendor.province) && (
                  <p className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {[vendor.city, vendor.province].filter(Boolean).join(', ')}
                  </p>
                )}
                {vendor.phone && (
                  <p className="flex items-center gap-1 text-xs text-gray-400">
                    <Phone className="h-3 w-3 shrink-0" />
                    {vendor.phone}
                  </p>
                )}
              </div>

              {vendor.permitNumber && (
                <span className="mt-2 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700 inline-block">
                  ✓ Permit {vendor.permitNumber}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 rounded-xl border bg-indigo-50 p-5 text-center">
        <p className="font-semibold text-indigo-900">Are you a street vendor?</p>
        <p className="text-sm text-indigo-700 mt-1">
          Register your stall to appear here and start receiving online orders.
        </p>
        <Link
          href="/vendor/dashboard"
          className="mt-3 inline-block rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Register My Stall
        </Link>
      </div>
    </div>
  )
}
