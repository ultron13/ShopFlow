import { Suspense } from 'react'
import { api } from '@/lib/trpc-server'
import { VendorMap } from './vendor-map'

export const metadata = { title: 'Find Farmers & Vendors Near You' }
export const revalidate = 120

const FARMER_CATEGORIES = ['Vegetable Farmer', 'Fruit Farmer', 'Organic Farmer', 'Herb & Spice Farmer', 'Urban Farmer']

export default async function MapPage() {
  const allVendors = await api.vendors.list.query({})

  const pins = allVendors
    .filter((v) => v.gpsLat != null && v.gpsLng != null)
    .map((v) => {
      const isFarmer = FARMER_CATEGORIES.includes(v.category ?? '')
      return {
        id: v.id,
        name: v.businessName,
        category: v.category ?? '',
        city: v.city ?? '',
        province: v.province ?? '',
        phone: v.phone ?? null,
        whatsapp: v.whatsapp ?? null,
        isVerified: v.isVerified,
        lat: v.gpsLat as number,
        lng: v.gpsLng as number,
        profileUrl: isFarmer ? `/farmers/${v.id}` : `/vendors/${v.id}`,
      }
    })

  const farmerCount  = pins.filter((p) => FARMER_CATEGORIES.includes(p.category)).length
  const vendorCount  = pins.length - farmerCount

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header bar */}
      <div className="shrink-0 flex items-center justify-between gap-4 border-b bg-white px-4 py-3 sm:px-6">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Farmers & Vendors Map</h1>
          <p className="text-xs text-gray-500">
            {farmerCount} farmers · {vendorCount} street vendors · click a pin to order
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-green-500 inline-block" /> Farmers
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-indigo-500 inline-block" /> Vendors
          </span>
        </div>
      </div>

      {/* Map — Leaflet loaded client-side only */}
      <div className="flex-1 min-h-0">
        <Suspense fallback={
          <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
            Loading map…
          </div>
        }>
          <VendorMap pins={pins} farmerCategories={FARMER_CATEGORIES} />
        </Suspense>
      </div>
    </div>
  )
}
