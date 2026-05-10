import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Phone, CheckCircle, Award, Sprout, ArrowLeft, ExternalLink } from 'lucide-react'
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
  'Vegetable Farmer':    '🥬',
  'Fruit Farmer':        '🍊',
  'Organic Farmer':      '🌱',
  'Herb & Spice Farmer': '🌿',
  'Urban Farmer':        '🏙️',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  try {
    const { id } = await params
    const farmer = await api.vendors.byId.query({ id })
    return {
      title: farmer.businessName,
      description:
        farmer.description ??
        `Order fresh produce directly from ${farmer.businessName} in ${farmer.city}, ${farmer.province}.`,
    }
  } catch {
    return { title: 'Farmer Profile' }
  }
}

export default async function FarmerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let farmer: Awaited<ReturnType<typeof api.vendors.byId.query>>
  try {
    farmer = await api.vendors.byId.query({ id })
  } catch {
    notFound()
  }

  if (!FARMER_CATEGORIES.includes(farmer.category ?? '')) {
    notFound()
  }

  const whatsappNumber = farmer.whatsapp?.replace(/^0/, '')
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/27${whatsappNumber}?text=${encodeURIComponent(
        `Hi ${farmer.businessName}, I would like to place an order.`
      )}`
    : null

  const hasGps = farmer.gpsLat != null && farmer.gpsLng != null
  const mapEmbedUrl = hasGps
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${farmer.gpsLng! - 0.05},${farmer.gpsLat! - 0.05},${farmer.gpsLng! + 0.05},${farmer.gpsLat! + 0.05}&layer=mapnik&marker=${farmer.gpsLat},${farmer.gpsLng}`
    : null
  const mapLinkUrl = hasGps
    ? `https://www.openstreetmap.org/?mlat=${farmer.gpsLat}&mlon=${farmer.gpsLng}#map=14/${farmer.gpsLat}/${farmer.gpsLng}`
    : farmer.address
    ? `https://maps.google.com/?q=${encodeURIComponent(
        [farmer.address, farmer.city, 'South Africa'].filter(Boolean).join(', ')
      )}`
    : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back */}
      <Link
        href="/farmers"
        className="inline-flex items-center gap-1.5 text-sm text-green-700 hover:text-green-800 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        All Farmers
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border bg-white p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{farmer.businessName}</h1>
              {farmer.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
            </div>
            {farmer.category && (
              <p className="mt-1 text-sm font-medium text-green-700">
                {CATEGORY_ICONS[farmer.category]} {farmer.category}
              </p>
            )}
            {(farmer.city || farmer.province) && (
              <p className="mt-1.5 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {[farmer.city, farmer.province].filter(Boolean).join(', ')}, South Africa
              </p>
            )}
          </div>
          {farmer.vatNumber && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <Award className="h-3.5 w-3.5" />
              VAT Registered
            </span>
          )}
        </div>

        {farmer.description && (
          <p className="mt-4 text-sm text-gray-600 leading-relaxed">{farmer.description}</p>
        )}
      </div>

      {/* Order + Details */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Order CTA */}
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
            <Sprout className="h-4 w-4 text-green-600" />
            Order Directly
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Message or call the farmer to ask about availability, pricing, and delivery to your area.
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
            {farmer.phone && (
              <a
                href={`tel:${farmer.phone}`}
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <Phone className="h-4 w-4 text-gray-400" />
                Call {farmer.phone}
              </a>
            )}
          </div>
        </div>

        {/* Farm details */}
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Farm Details</h2>
          <dl className="space-y-3 text-sm">
            {farmer.user?.name && (
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Farmer</dt>
                <dd className="text-gray-700">{farmer.user.name}</dd>
              </div>
            )}
            {farmer.address && (
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Address</dt>
                <dd className="text-gray-700">{farmer.address}</dd>
              </div>
            )}
            {farmer.permitNumber && (
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Permit</dt>
                <dd className="text-green-700 font-medium">✓ {farmer.permitNumber}</dd>
              </div>
            )}
            {farmer.vatNumber && (
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">VAT Number</dt>
                <dd className="text-gray-700">{farmer.vatNumber}</dd>
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
              <MapPin className="h-4 w-4 text-green-600" />
              Farm Location
            </h2>
            {mapLinkUrl && (
              <a
                href={mapLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-green-700 hover:underline"
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
            title={`Map of ${farmer.businessName}`}
            loading="lazy"
          />
        </div>
      ) : mapLinkUrl ? (
        <div className="mt-6 rounded-2xl border bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-3">
            <MapPin className="h-4 w-4 text-green-600" />
            Farm Location
          </h2>
          <a
            href={mapLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-green-700 hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View on Google Maps
          </a>
        </div>
      ) : null}

      {/* How to order */}
      <div className="mt-6 rounded-2xl bg-green-50 border border-green-100 p-5">
        <h2 className="text-sm font-semibold text-green-900 mb-3">How to Order</h2>
        <ol className="space-y-2 text-sm text-green-800">
          <li className="flex gap-2">
            <span className="font-bold shrink-0">1.</span>
            Tap <strong>WhatsApp to Order</strong> above to message the farmer directly.
          </li>
          <li className="flex gap-2">
            <span className="font-bold shrink-0">2.</span>
            Tell them what you need, how much, and your delivery address or pickup preference.
          </li>
          <li className="flex gap-2">
            <span className="font-bold shrink-0">3.</span>
            Agree on price and arrange payment — EFT, cash on delivery, or SnapScan.
          </li>
          <li className="flex gap-2">
            <span className="font-bold shrink-0">4.</span>
            Receive fresh produce straight from the farm to your door.
          </li>
        </ol>
      </div>

      {/* Back */}
      <div className="mt-8 text-center">
        <Link
          href="/farmers"
          className="inline-flex items-center gap-1.5 text-sm text-green-700 hover:text-green-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Browse all farmers
        </Link>
      </div>
    </div>
  )
}
