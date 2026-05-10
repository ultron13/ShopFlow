'use client'

import { trpc } from '@/lib/trpc'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Phone, CheckCircle, Search } from 'lucide-react'

const SA_PROVINCES = ['All','Limpopo','Gauteng','KwaZulu-Natal','Western Cape','Eastern Cape','Mpumalanga','North West','Free State','Northern Cape']
const CATEGORIES = ['All','Fruits & Vegetables','Clothing','Cooked Food','Spices & Herbs','Crafts']

export default function VendorsPage() {
  const [province, setProvince] = useState<string | undefined>()
  const [category, setCategory] = useState<string | undefined>()
  const [search, setSearch] = useState('')
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {}
    )
  }, [])

  const { data: vendors = [], isLoading } = trpc.vendors.list.useQuery({
    province: province === 'All' || !province ? undefined : province,
    category: category === 'All' || !category ? undefined : category,
    lat: userPos?.lat,
    lng: userPos?.lng,
  })

  const filtered = vendors.filter((v) =>
    !search || v.businessName.toLowerCase().includes(search.toLowerCase()) ||
    v.city?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Find Vendors Near You</h1>
        <p className="mt-1 text-sm text-gray-500">Discover street vendors selling fresh produce across South Africa</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendor or city…"
            className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <select value={province ?? 'All'} onChange={(e) => setProvince(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
          {SA_PROVINCES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select value={category ?? 'All'} onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Map placeholder — real map requires Leaflet SSR handling */}
      {userPos && (
        <div className="mb-6 rounded-xl border bg-indigo-50 p-4 text-sm text-indigo-700 flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0" />
          Location detected — showing vendors near you. {filtered.filter(v => v.gpsLat).length} have GPS coordinates.
        </div>
      )}

      {isLoading && <p className="text-center py-20 text-gray-400">Loading vendors…</p>}

      {!isLoading && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed bg-gray-50 py-20 text-center text-gray-400">
          <p className="text-3xl mb-2">🏪</p>
          <p className="font-medium">No vendors found</p>
          <p className="text-sm mt-1">Try adjusting your filters or <Link href="/vendor/dashboard" className="text-indigo-600 underline">register as a vendor</Link></p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((vendor) => (
          <Link key={vendor.id} href={`/vendor/${vendor.id}`}
            className="block rounded-xl border bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-1">
                  {vendor.businessName}
                  {vendor.isVerified && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
                </h3>
                {vendor.category && <p className="text-xs text-indigo-600 mt-0.5">{vendor.category}</p>}
              </div>
            </div>
            {vendor.description && (
              <p className="mt-2 text-xs text-gray-500 line-clamp-2">{vendor.description}</p>
            )}
            <div className="mt-3 space-y-1">
              {(vendor.city || vendor.province) && (
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="h-3 w-3" />
                  {[vendor.city, vendor.province].filter(Boolean).join(', ')}
                </p>
              )}
              {vendor.phone && (
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <Phone className="h-3 w-3" />
                  {vendor.phone}
                </p>
              )}
            </div>
            {vendor.permitNumber && (
              <p className="mt-2 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700 inline-block">
                Permit: {vendor.permitNumber}
              </p>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-xl border bg-indigo-50 p-5 text-center">
        <p className="font-semibold text-indigo-900">Are you a street vendor?</p>
        <p className="text-sm text-indigo-700 mt-1">Register your stall to appear on this map and start receiving online orders.</p>
        <Link href="/vendor/dashboard"
          className="mt-3 inline-block rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          Register My Stall
        </Link>
      </div>
    </div>
  )
}
