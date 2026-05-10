'use client'

import { trpc } from '@/lib/trpc'
import { formatPrice, formatDate } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { use, useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

type ContributionMethod = 'PAYFAST' | 'OZOW' | 'SNAPSCAN' | 'COD'

const CONTRIBUTION_OPTIONS: { id: ContributionMethod; label: string; icon: string }[] = [
  { id: 'PAYFAST',  label: 'PayFast',          icon: '🔵' },
  { id: 'OZOW',     label: 'Ozow EFT',         icon: '🏦' },
  { id: 'SNAPSCAN', label: 'SnapScan',          icon: '📱' },
  { id: 'COD',      label: 'Cash (in-person)',  icon: '💵' },
]

export default function StokvelGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const router = useRouter()

  const { data: group, isLoading, refetch } = trpc.stokvel.get.useQuery({ id })

  const [memberEmail, setMemberEmail] = useState(session?.user?.email ?? '')
  const [amount, setAmount] = useState('')
  const [contributionMethod, setContributionMethod] = useState<ContributionMethod>('PAYFAST')
  const [paymentRef, setPaymentRef] = useState('')

  const contribute = trpc.stokvel.contribute.useMutation({
    onSuccess() {
      toast.success('Contribution recorded!')
      setAmount('')
      setPaymentRef('')
      refetch()
    },
    onError(err) {
      toast.error(err.message)
    },
  })

  const placeOrder = trpc.stokvel.placeOrder.useMutation({
    onSuccess(data) {
      toast.success('Group order placed!')
      router.push(`/account/orders`)
    },
    onError(err) {
      toast.error(err.message)
    },
  })

  if (isLoading) {
    return <div className="flex justify-center py-20 text-gray-400">Loading group…</div>
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-gray-400">
        <p>Group not found.</p>
        <Link href="/stokvel" className="mt-3 text-indigo-600 hover:underline text-sm">Back to groups</Link>
      </div>
    )
  }

  const totalContributed = group.contributions
    .filter((c) => c.status === 'CONFIRMED')
    .reduce((sum, c) => sum + Number(c.amount), 0)
  const progress = Math.min((totalContributed / Number(group.targetAmount)) * 100, 100)
  const remaining = Math.max(Number(group.targetAmount) - totalContributed, 0)
  const isCreator = session?.user?.email && group.createdById
  const canPlaceOrder = remaining < 0.01 && group.status === 'COLLECTING'

  const cartItems = group.cartItems as Array<{ productId: string; variantId?: string; quantity: number }>

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/stokvel" className="text-sm text-indigo-600 hover:underline">← Back to groups</Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
          {group.description && <p className="mt-1 text-sm text-gray-500">{group.description}</p>}
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
          group.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
          group.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
          'bg-indigo-100 text-indigo-700'
        }`}>
          {group.status === 'COLLECTING' ? 'Collecting' : group.status === 'COMPLETED' ? 'Order Placed' : 'Cancelled'}
        </span>
      </div>

      {/* Progress */}
      <div className="mt-6 rounded-xl border bg-white p-5">
        <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
          <span>Raised: {formatPrice(totalContributed)}</span>
          <span>Target: {formatPrice(Number(group.targetAmount))}</span>
        </div>
        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400 text-right">
          {remaining > 0 ? `${formatPrice(remaining)} still needed` : '🎉 Target reached!'}
        </p>

        {canPlaceOrder && (
          <button
            onClick={() => placeOrder.mutate({ groupId: id })}
            disabled={placeOrder.isPending}
            className="mt-4 w-full rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {placeOrder.isPending ? 'Placing order…' : '🛒 Place Group Order Now'}
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Members & their contributions */}
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Members</h2>
          <ul className="space-y-3">
            {group.members.map((member) => {
              const memberTotal = member.contributions
                .filter((c) => c.status === 'CONFIRMED')
                .reduce((sum, c) => sum + Number(c.amount), 0)
              const memberProgress = Math.min((memberTotal / Number(member.shareAmount)) * 100, 100)
              return (
                <li key={member.id} className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-800">{member.name ?? member.email}</span>
                    <span className="text-gray-400">
                      {formatPrice(memberTotal)} / {formatPrice(Number(member.shareAmount))}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${memberProgress >= 100 ? 'bg-green-500' : 'bg-indigo-400'}`}
                      style={{ width: `${memberProgress}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Contribute form */}
        {group.status === 'COLLECTING' && (
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Add a Contribution</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Your Email</label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="Must match your member email"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Amount (ZAR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border py-2 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {CONTRIBUTION_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-xs transition ${
                        contributionMethod === opt.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="contributionMethod"
                        value={opt.id}
                        checked={contributionMethod === opt.id}
                        onChange={() => setContributionMethod(opt.id)}
                        className="accent-indigo-600"
                      />
                      <span>{opt.icon}</span>
                      <span className="font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Payment Reference (optional)</label>
                <input
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. PayFast ref, EFT proof"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <button
                onClick={() =>
                  contribute.mutate({
                    groupId: id,
                    memberEmail,
                    amount: Number(amount),
                    paymentMethod: contributionMethod,
                    paymentRef: paymentRef || undefined,
                  })
                }
                disabled={contribute.isPending || !memberEmail || !amount}
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {contribute.isPending ? 'Recording…' : 'Record Contribution'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contribution history */}
      {group.contributions.length > 0 && (
        <div className="mt-6 rounded-xl border bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Contribution History</h2>
          <ul className="divide-y text-sm">
            {group.contributions.map((c) => {
              const member = group.members.find((m) => m.id === c.memberId)
              return (
                <li key={c.id} className="flex items-center justify-between py-2.5 gap-3">
                  <div>
                    <span className="font-medium text-gray-800">{member?.name ?? member?.email}</span>
                    <span className="ml-2 text-gray-400">via {c.paymentMethod}</span>
                    {c.paymentRef && <span className="ml-2 text-xs text-gray-300">ref: {c.paymentRef}</span>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold text-gray-900">{formatPrice(Number(c.amount))}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      c.status === 'FAILED' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Order items */}
      <div className="mt-6 rounded-xl border bg-white p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Order Items ({cartItems.length})</h2>
        <ul className="space-y-1 text-sm text-gray-600">
          {cartItems.map((item, i) => (
            <li key={i} className="flex justify-between">
              <span>Product ID: {item.productId.slice(-8)}</span>
              <span>× {item.quantity}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm font-semibold text-gray-900 border-t pt-3 flex justify-between">
          <span>Total</span>
          <span>{formatPrice(Number(group.targetAmount))}</span>
        </p>
      </div>
    </div>
  )
}
