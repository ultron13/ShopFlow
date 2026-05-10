'use client'

import { trpc } from '@/lib/trpc'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { MapPin } from 'lucide-react'

const SA_PROVINCES = ['Limpopo','Gauteng','KwaZulu-Natal','Western Cape','Eastern Cape','Mpumalanga','North West','Free State','Northern Cape']
const CATEGORIES = ['Fruits & Vegetables','Cooked Food','Clothing','Spices & Herbs','Dairy & Eggs','Crafts','Baked Goods']

export default function VendorDashboard() {
  const { data: session } = useSession()
  const { data: existing, isLoading } = trpc.vendors.me.useQuery(undefined, { enabled: !!session })

  const [form, setForm] = useState({
    businessName: '', description: '', phone: '', whatsapp: '',
    address: '', city: '', province: 'Limpopo', category: 'Fruits & Vegetables',
    permitNumber: '', vatNumber: '', gpsLat: undefined as number | undefined, gpsLng: undefined as number | undefined,
  })

  useEffect(() => {
    if (existing) {
      setForm({
        businessName: existing.businessName,
        description: existing.description ?? '',
        phone: existing.phone ?? '',
        whatsapp: existing.whatsapp ?? '',
        address: existing.address ?? '',
        city: existing.city ?? '',
        province: existing.province,
        category: existing.category ?? 'Fruits & Vegetables',
        permitNumber: existing.permitNumber ?? '',
        vatNumber: existing.vatNumber ?? '',
        gpsLat: existing.gpsLat ?? undefined,
        gpsLng: existing.gpsLng ?? undefined,
      })
    }
  }, [existing])

  const save = trpc.vendors.register.useMutation({
    onSuccess: () => toast.success('Vendor profile saved!'),
    onError: (e) => toast.error(e.message),
  })

  function detectGps() {
    navigator.geolocation?.getCurrentPosition(
      (p) => setForm((f) => ({ ...f, gpsLat: p.coords.latitude, gpsLng: p.coords.longitude })),
      () => toast.error('Could not detect GPS location')
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    save.mutate({
      ...form,
      description: form.description || undefined,
      phone: form.phone || undefined,
      whatsapp: form.whatsapp || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      permitNumber: form.permitNumber || undefined,
      vatNumber: form.vatNumber || undefined,
    })
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-3xl mb-3">🏪</p>
        <h1 className="text-xl font-bold text-gray-900">Vendor Dashboard</h1>
        <p className="mt-2 text-gray-500 text-sm">Sign in to manage your stall profile.</p>
        <Link href="/sign-in" className="mt-5 inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700">Sign In</Link>
      </div>
    )
  }

  if (isLoading) return <div className="flex justify-center py-20 text-gray-400">Loading…</div>

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {existing ? (existing.isVerified ? '✅ Verified vendor' : '⏳ Pending verification') : 'Register your stall'}
          </p>
        </div>
        <Link href="/vendors" className="text-sm text-indigo-600 hover:underline">View all vendors →</Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Business / Stall Name *</label>
            <input required value={form.businessName} onChange={(e) => setForm(f => ({...f, businessName: e.target.value}))}
              placeholder="e.g. Mama Thandi's Fresh Veg"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm(f => ({...f, description: e.target.value}))}
              placeholder="What do you sell? Where are you located?"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm(f => ({...f, category: e.target.value}))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Province</label>
            <select value={form.province} onChange={(e) => setForm(f => ({...f, province: e.target.value}))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              {SA_PROVINCES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">City / Town</label>
            <input value={form.city} onChange={(e) => setForm(f => ({...f, city: e.target.value}))}
              placeholder="e.g. Thohoyandou"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Street Address / Market Name</label>
            <input value={form.address} onChange={(e) => setForm(f => ({...f, address: e.target.value}))}
              placeholder="e.g. Mvusuludzo Market, Stall 12"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <input value={form.phone} onChange={(e) => setForm(f => ({...f, phone: e.target.value}))}
              placeholder="0XX XXX XXXX"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp Number</label>
            <input value={form.whatsapp} onChange={(e) => setForm(f => ({...f, whatsapp: e.target.value}))}
              placeholder="0XX XXX XXXX"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Hawker's Permit Number</label>
            <input value={form.permitNumber} onChange={(e) => setForm(f => ({...f, permitNumber: e.target.value}))}
              placeholder="e.g. LIM/2024/00123"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">VAT Number <span className="text-gray-400">(if VAT vendor)</span></label>
            <input value={form.vatNumber} onChange={(e) => setForm(f => ({...f, vatNumber: e.target.value}))}
              placeholder="4XXXXXXXXX"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
        </div>

        {/* GPS */}
        <div className="rounded-lg border bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600 flex items-center gap-1"><MapPin className="h-3 w-3" /> GPS Location</label>
            <button type="button" onClick={detectGps} className="text-xs text-indigo-600 hover:underline">Detect my location</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" step="any" value={form.gpsLat ?? ''} onChange={(e) => setForm(f => ({...f, gpsLat: e.target.value ? Number(e.target.value) : undefined}))}
              placeholder="Latitude" className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            <input type="number" step="any" value={form.gpsLng ?? ''} onChange={(e) => setForm(f => ({...f, gpsLng: e.target.value ? Number(e.target.value) : undefined}))}
              placeholder="Longitude" className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <p className="mt-1.5 text-xs text-gray-400">Used to show your stall on the vendor map for nearby buyers.</p>
        </div>

        <button type="submit" disabled={save.isPending}
          className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
          {save.isPending ? 'Saving…' : existing ? 'Update Profile' : 'Register My Stall'}
        </button>
      </form>
    </div>
  )
}
