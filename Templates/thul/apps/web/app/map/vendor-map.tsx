'use client'

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap } from 'leaflet'

export interface VendorPin {
  id: string
  name: string
  category: string
  city: string
  province: string
  phone: string | null
  whatsapp: string | null
  isVerified: boolean
  lat: number
  lng: number
}

type Layer = 'all' | 'vendors' | 'farmers'

export function VendorMap({
  pins,
  farmerCategories,
}: {
  pins: VendorPin[]
  farmerCategories: string[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<import('leaflet').Marker[]>([])
  const [layer, setLayer] = useState<Layer>('all')
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Dynamic import — Leaflet requires window
    import('leaflet').then((L) => {
      // Fix default icon paths broken by bundlers
      // @ts-expect-error _getIconUrl is not typed
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!, {
        center: [-29.0, 25.0],  // centre of South Africa
        zoom: 6,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map
      renderMarkers(L, map, pins, farmerCategories, 'all', markersRef)
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-render markers when layer changes
  useEffect(() => {
    if (!mapRef.current) return
    import('leaflet').then((L) => {
      renderMarkers(L, mapRef.current!, pins, farmerCategories, layer, markersRef)
    })
  }, [layer, pins, farmerCategories])

  function locateMe() {
    if (!mapRef.current) return
    setLocating(true)
    mapRef.current.locate({ setView: true, maxZoom: 13 })
    mapRef.current.once('locationfound', () => setLocating(false))
    mapRef.current.once('locationerror', () => {
      setLocating(false)
      alert('Could not determine your location.')
    })
  }

  const LAYER_BUTTONS: { id: Layer; label: string }[] = [
    { id: 'all',     label: 'All' },
    { id: 'vendors', label: 'Vendors only' },
    { id: 'farmers', label: 'Farmers only' },
  ]

  return (
    <div className="relative h-full w-full">
      {/* Controls overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
        {/* Layer toggle */}
        <div className="flex rounded-lg overflow-hidden shadow border border-gray-200 bg-white text-xs font-medium">
          {LAYER_BUTTONS.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setLayer(btn.id)}
              className={`px-3 py-1.5 transition ${
                layer === btn.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Locate me */}
        <button
          onClick={locateMe}
          disabled={locating}
          className="rounded-lg bg-white border border-gray-200 shadow px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 flex items-center gap-1.5"
        >
          📍 {locating ? 'Locating…' : 'Locate me'}
        </button>
      </div>

      {/* Map container — must have explicit height */}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}

function renderMarkers(
  L: typeof import('leaflet'),
  map: LeafletMap,
  pins: VendorPin[],
  farmerCategories: string[],
  layer: Layer,
  markersRef: React.MutableRefObject<import('leaflet').Marker[]>
) {
  // Clear existing markers
  markersRef.current.forEach((m) => m.remove())
  markersRef.current = []

  const visible = pins.filter((p) => {
    const isFarmer = farmerCategories.includes(p.category)
    if (layer === 'vendors') return !isFarmer
    if (layer === 'farmers') return isFarmer
    return true
  })

  visible.forEach((pin) => {
    const isFarmer = farmerCategories.includes(pin.category)

    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:28px;height:28px;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        background:${isFarmer ? '#22c55e' : '#6366f1'};
        border:2px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,.35);
      "></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -30],
    })

    const waLink = pin.whatsapp
      ? `<a href="https://wa.me/27${pin.whatsapp.replace(/^0/, '')}" target="_blank"
           style="display:inline-block;margin-top:8px;padding:4px 10px;background:#16a34a;color:#fff;
                  border-radius:6px;font-size:11px;text-decoration:none;">💬 WhatsApp to Order</a>`
      : ''

    const popup = `
      <div style="font-family:system-ui,sans-serif;min-width:160px;max-width:220px">
        <p style="font-weight:600;font-size:13px;margin:0 0 2px">${pin.name}</p>
        <p style="font-size:11px;color:${isFarmer ? '#15803d' : '#4f46e5'};margin:0 0 4px">${pin.category || (isFarmer ? 'Farmer' : 'Vendor')}</p>
        <p style="font-size:11px;color:#6b7280;margin:0">${[pin.city, pin.province].filter(Boolean).join(', ')}</p>
        ${pin.phone ? `<p style="font-size:11px;color:#6b7280;margin:2px 0 0">📞 ${pin.phone}</p>` : ''}
        ${pin.isVerified ? `<p style="font-size:11px;color:#16a34a;margin:4px 0 0">✓ Verified</p>` : ''}
        ${waLink}
      </div>`

    const marker = L.marker([pin.lat, pin.lng], { icon })
      .bindPopup(popup, { maxWidth: 240 })
      .addTo(map)

    markersRef.current.push(marker)
  })
}
