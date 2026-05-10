'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRef } from 'react'

export function SearchBar() {
  const router = useRouter()
  const params = useSearchParams()
  const ref = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = ref.current?.value.trim()
    if (!q) return
    const next = new URLSearchParams(params.toString())
    next.set('search', q)
    next.delete('page')
    router.push(`/products?${next.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        ref={ref}
        defaultValue={params.get('search') ?? ''}
        placeholder="Search products…"
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      />
    </form>
  )
}
