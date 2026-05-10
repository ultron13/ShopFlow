'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const options = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

export function SortSelect({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const params = useSearchParams()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(params.toString())
    next.set('sortBy', e.target.value)
    next.delete('page')
    router.push(`/products?${next.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-500">Sort:</label>
      <select
        defaultValue={defaultValue}
        onChange={handleChange}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
