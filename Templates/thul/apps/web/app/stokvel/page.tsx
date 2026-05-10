'use client'

import { trpc } from '@/lib/trpc'
import { formatPrice } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/cart-store'

export default function StokvelPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const cartItems = useCartStore((s) => s.items)
  const cartTotal = useCartStore((s) => s.total)

  const { data: groups, isLoading, refetch } = trpc.stokvel.list.useQuery(undefined, {
    enabled: !!session,
  })

  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [members, setMembers] = useState([{ email: '', name: '', shareAmount: '' }])

  const createGroup = trpc.stokvel.create.useMutation({
    onSuccess(data) {
      toast.success('Stokvel group created!')
      setShowCreate(false)
      refetch()
      router.push(`/stokvel/${data.id}`)
    },
    onError(err) {
      toast.error(err.message)
    },
  })

  function addMember() {
    setMembers((prev) => [...prev, { email: '', name: '', shareAmount: '' }])
  }

  function updateMember(index: number, field: string, value: string) {
    setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)))
  }

  function removeMember(index: number) {
    setMembers((prev) => prev.filter((_, i) => i !== index))
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (cartItems.length === 0) {
      toast.error('Add items to your cart first')
      return
    }
    const validMembers = members.filter((m) => m.email && m.shareAmount)
    if (validMembers.length === 0) {
      toast.error('Add at least one member with a share amount')
      return
    }
    createGroup.mutate({
      name,
      description: description || undefined,
      targetAmount: cartTotal(),
      cartItems: cartItems.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
      members: validMembers.map((m) => ({
        email: m.email,
        name: m.name || undefined,
        shareAmount: Number(m.shareAmount),
      })),
    })
  }

  const totalShares = members.reduce((sum, m) => sum + (Number(m.shareAmount) || 0), 0)

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-4xl mb-4">🤝</p>
        <h1 className="text-2xl font-bold text-gray-900">Stokvel Group Buying</h1>
        <p className="mt-3 text-gray-500">
          Pool money with your community to buy together. Sign in to create or join a group.
        </p>
        <Link
          href="/sign-in"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Stokvel Groups</h1>
          <p className="mt-1 text-sm text-gray-500">Pool contributions with your community to buy together</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {showCreate ? 'Cancel' : '+ New Group'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="mt-6 rounded-xl border bg-white p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Create a New Group</h2>

          {cartItems.length === 0 ? (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
              Your cart is empty. <Link href="/products" className="underline font-medium">Add products</Link> first — they become the group order.
            </div>
          ) : (
            <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-4 text-sm text-indigo-800">
              Group will order {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} — total{' '}
              <strong>{formatPrice(cartTotal())}</strong>. All member shares must add up to this amount.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Thohoyandou Market Stokvel"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Members & Shares *</label>
              <button type="button" onClick={addMember} className="text-xs text-indigo-600 hover:underline">
                + Add member
              </button>
            </div>
            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={m.email}
                    onChange={(e) => updateMember(i, 'email', e.target.value)}
                    className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <input
                    placeholder="Name"
                    value={m.name}
                    onChange={(e) => updateMember(i, 'name', e.target.value)}
                    className="w-28 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={m.shareAmount}
                      onChange={(e) => updateMember(i, 'shareAmount', e.target.value)}
                      className="w-full rounded-lg border py-2 pl-6 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  {members.length > 1 && (
                    <button type="button" onClick={() => removeMember(i)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                  )}
                </div>
              ))}
            </div>
            <div className={`mt-2 text-xs ${Math.abs(totalShares - cartTotal()) < 0.01 ? 'text-green-600' : 'text-gray-400'}`}>
              Total shares: {formatPrice(totalShares)} / {formatPrice(cartTotal())} needed
            </div>
          </div>

          <button
            type="submit"
            disabled={createGroup.isPending || cartItems.length === 0}
            className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {createGroup.isPending ? 'Creating…' : 'Create Group'}
          </button>
        </form>
      )}

      {/* Groups list */}
      <div className="mt-8 space-y-4">
        {isLoading && <p className="text-center text-gray-400 py-10">Loading groups…</p>}
        {groups?.length === 0 && !showCreate && (
          <div className="rounded-xl border border-dashed bg-gray-50 py-16 text-center text-gray-400">
            <p className="text-3xl mb-2">🤝</p>
            <p className="font-medium">No groups yet</p>
            <p className="text-sm mt-1">Create one to start pooling with your community</p>
          </div>
        )}
        {groups?.map((group) => {
          const confirmed = group.contributions.filter((c) => c.status === 'CONFIRMED')
          const totalContributed = confirmed.reduce((sum, c) => sum + Number(c.amount), 0)
          const progress = Math.min((totalContributed / Number(group.targetAmount)) * 100, 100)
          return (
            <Link
              key={group.id}
              href={`/stokvel/${group.id}`}
              className="block rounded-xl border bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {group.members.length} member{group.members.length !== 1 ? 's' : ''} · Target {formatPrice(Number(group.targetAmount))}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                  group.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  group.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                  'bg-indigo-100 text-indigo-700'
                }`}>
                  {group.status === 'COLLECTING' ? 'Collecting' : group.status === 'COMPLETED' ? 'Completed' : 'Cancelled'}
                </span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{formatPrice(totalContributed)} raised</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
