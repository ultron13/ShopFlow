import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Phone, CheckCircle, Award, Store, ArrowLeft, ExternalLink } from 'lucide-react'
import { api } from '@/lib/trpc-server'
import type { Metadata } from 'next'

export const revalidate = 300

const FARMER_CATEGORIES = [
  'Vegetable Farmer',
  'Fruit Farmer',
  'Organic Farmer',
  'Herb & Spice Farmer',
  'Urban Farmer',
]

const CATEGORY_ICONS: Record<string, string> = {
  'Fruits & Vegetables': '🥦',
  'Cooked Food':         '🍲',
  'Clothing':            '👗',
  'Spices & Herbs':      '🌶️',
  'Dairy & Eggs':        '🥚',
  'Crafts':              '🪴',
  'Baked Goods':         '🍞',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  try {
    const { id } = await params
    const vendor = await api.vendors.byId.query({ id })
    return {
      title: vendor.businessName,
      description:
        vendor.description ??
        `Visit ${vendor.businessName} in ${vendor.city}, ${vendor.province} — fresh produce and goods at your local SA market.`,
    }
  } catch {
    return { title: 'Vendor Profile' }
  }
}

export default async function VendorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let vendor: Awaited<ReturnType<typeof api.vendors.byId.query>>
  try {
    vendor = await api.vendors.byId.query({ id })
  } catch {
    notFound()
  }

  // Redirect farmer categories to their own profile page
  if (FARMER_CATEGORIES.includes(vendor.category ?? '')) {
    notFound()
  }

  const whatsappNumber = vendor.whatsapp?.replace(/^0/, '')
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/27${whatsappNumber}?text=${encodeURIComponent(
        `Hi ${vendor.businessName}, I would like to place an order.`
      )}`
    : null

  const hasGps = vendor.gpsLat != null && vendor.gpsLng != null
  const mapEmbedUrl = hasGps
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${vendor.gpsLng! - 0.05},${vendor.gpsLat! - 0.05},${vendor.gpsLng! + 0.05},${vendor.gpsLat! + 0.05}&layer=mapnik&marker=${vendor.gpsLat},${vendor.gpsLng}`
    : null
  const mapLinkUrl = hasGps
    ? `https://www.openstreetmap.org/?mlat=${vendor.gpsLat}&mlon=${vendor.gpsLng}#map=15/${vendor.gpsLat}/${vendor.gpsLng}`
    : vendor.address
    ? `https://maps.google.com/?q=${encodeURIComponent(
        [vendor.address, vendor.city, 'South Africa'].filter(Boolean).join(', ')
      )}`
    : null

  const categoryIcon = vendor.category ? (CATEGORY_ICONS[vendor.category] ?? '🏪') : '🏪'

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back */}
      <Link
        href="/vendors"
        className="inline-flex items-center gap-1.5 text-sm text-indigo-700 hover:text-indigo-800 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        All Vendors
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border bg-white p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{vendor.businessName}</h1>
              {vendor.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
            </div>
            {vendor.category && (
              <p className="mt-1 text-sm font-medium text-indigo-600">
                {categoryIcon} {vendor.category}
              </p>
            )}
            {(vendor.city || vendor.province) && (
              <p className="mt-1.5 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {[vendor.city, vendor.province].filter(Boolean).join(', ')}, South Africa
              </p>
            )}
          </div>
          {vendor.vatNumber && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <Award className="h-3.5 w-3.5" />
              VAT Registered
            </span>
          )}
        </div>

        {vendor.description && (
          <p className="mt-4 text-sm text-gray-600 leading-relaxed">{vendor.description}</p>
        )}
      </div>

      {/* Order + Details */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Order CTA */}
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
            <Store className="h-4 w-4 text-indigo-600" />
            Contact & Order
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Message or call the vendor to ask about stock, pricing, and collection or delivery options.
          </p>
          <div className="space-y-2">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 transition"
              >
                💬 WhatsApp to Order
              </a>
            ) : (
              <p className="text-xs text-gray-400 italic">No WhatsApp number listed — use phone below.</p>
            )}
            {vendor.phone && (
              <a
                href={`tel:${vendor.phone}`}
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <Phone className="h-4 w-4 text-gray-400" />
                Call {vendor.phone}
              </a>
            )}
          </div>
        </div>

        {/* Stall details */}
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Stall Details</h2>
          <dl className="space-y-3 text-sm">
            {vendor.user?.name && (
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Trader</dt>
                <dd className="text-gray-700">{vendor.user.name}</dd>
              </div>
            )}
            {vendor.address && (
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Location</dt>
                <dd className="text-gray-700">{vendor.address}</dd>
              </div>
            )}
            {vendor.permitNumber && (
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Permit</dt>
                <dd className="text-green-700 font-medium">✓ {vendor.permitNumber}</dd>
              </div>
            )}
            {vendor.vatNumber && (
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">VAT Number</dt>
                <dd className="text-gray-700">{vendor.vatNumber}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Map */}
      {mapEmbedUrl ? (
        <div className="mt-6 rounded-2xl border bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-indigo-600" />
              Stall Location
            </h2>
            {mapLinkUrl && (
              <a
                href={mapLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:underline"
              >
                Open in Maps <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <iframe
            src={mapEmbedUrl}
            width="100%"
            height="280"
            className="block border-0"
            title={`Map of ${vendor.businessName}`}
            loading="lazy"
          />
        </div>
      ) : mapLinkUrl ? (
        <div className="mt-6 rounded-2xl border bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-3">
            <MapPin className="h-4 w-4 text-indigo-600" />
            Stall Location
          </h2>
          <a
            href={mapLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-indigo-700 hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View on Google Maps
          </a>
        </div>
      ) : null}

      {/* How to order */}
      <div className="mt-6 rounded-2xl bg-indigo-50 border border-indigo-100 p-5">
        <h2 className="text-sm font-semibold text-indigo-900 mb-3">How to Order</h2>
        <ol className="space-y-2 text-sm text-indigo-800">
          <li className="flex gap-2">
            <span className="font-bold shrink-0">1.</span>
            Tap <strong>WhatsApp to Order</strong> above to message the vendor directly.
          </li>
          <li className="flex gap-2">
            <span className="font-bold shrink-0">2.</span>
            Tell them what you need, how much, and whether you want delivery or will collect at the stall.
          </li>
          <li className="flex gap-2">
            <span className="font-bold shrink-0">3.</span>
            Agree on price and arrange payment — EFT, cash, or SnapScan.
          </li>
          <li className="flex gap-2">
            <span className="font-bold shrink-0">4.</span>
            Collect at the stall or receive your goods at your door.
          </li>
        </ol>
      </div>

      {/* Back */}
      <div className="mt-8 text-center">
        <Link
          href="/vendors"
          className="inline-flex items-center gap-1.5 text-sm text-indigo-700 hover:text-indigo-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Browse all vendors
        </Link>
      </div>
    </div>
  )
}
