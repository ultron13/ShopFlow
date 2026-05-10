'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState, useTransition } from 'react'

const SA_PROVINCES = ['All','Limpopo','Gauteng','KwaZulu-Natal','Western Cape','Eastern Cape','Mpumalanga','North West','Free State','Northern Cape']

export function FarmerFilters({
  province,
  search,
}: {
  province: string
  search: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [searchVal, setSearchVal] = useState(search)

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'All') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setSearchVal(v)
    update('search', v)
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={searchVal}
          onChange={handleSearch}
          placeholder="Search farm or city…"
          className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
        />
      </div>
      <select
        value={province}
        onChange={(e) => update('province', e.target.value)}
        className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
      >
        {SA_PROVINCES.map((p) => <option key={p}>{p}</option>)}
      </select>
    </div>
  )
}
