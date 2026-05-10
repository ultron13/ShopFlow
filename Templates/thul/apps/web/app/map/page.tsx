import { Suspense } from 'react'
import { api } from '@/lib/trpc-server'
import { VendorMap } from './vendor-map'

export const metadata = { title: 'Vendor Map' }
export const revalidate = 120

export default async function MapPage() {
  const allVendors = await api.vendors.list.query({})

  const pins = allVendors
    .filter((v) => v.gpsLat != null && v.gpsLng != null)
    .map((v) => ({
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
    }))

  const farmerCategories = ['Vegetable Farmer', 'Fruit Farmer', 'Organic Farmer', 'Herb & Spice Farmer', 'Urban Farmer']

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header bar */}
      <div className="shrink-0 flex items-center justify-between gap-4 border-b bg-white px-4 py-3 sm:px-6">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Vendor & Farmer Map</h1>
          <p className="text-xs text-gray-500">
            {pins.length} locations across South Africa · click a pin for details
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-indigo-500 inline-block" /> Vendors
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-green-500 inline-block" /> Farmers
          </span>
        </div>
      </div>

      {/* Map — dynamic import so Leaflet only runs in the browser */}
      <div className="flex-1 min-h-0">
        <Suspense fallback={
          <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
            Loading map…
          </div>
        }>
          <VendorMap pins={pins} farmerCategories={farmerCategories} />
        </Suspense>
      </div>
    </div>
  )
}
