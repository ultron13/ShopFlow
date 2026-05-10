import { Suspense } from 'react'
import { api } from '@/lib/trpc-server'
import { ProductCard } from '@/components/store/product-card'
import { SearchBar } from '@/components/store/search-bar'
import { SortSelect } from '@/components/store/sort-select'
import Link from 'next/link'

export const revalidate = 60

interface PageProps {
  searchParams: Promise<{
    search?: string
    categorySlug?: string
    featured?: string
    minPrice?: string
    maxPrice?: string
    sortBy?: string
    page?: string
  }>
}

const categories = [
  { name: 'All', slug: undefined },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Clothing', slug: 'clothing' },
  { name: 'Home & Kitchen', slug: 'home-kitchen' },
]

export default async function ProductsPage({ searchParams: searchParamsPromise }: PageProps) {
  const searchParams = await searchParamsPromise
  const page = Number(searchParams.page ?? '1')
  const sortBy = (searchParams.sortBy as 'newest' | 'price_asc' | 'price_desc') ?? 'newest'

  const { products, total, pages } = await api.products.list.query({
    search: searchParams.search,
    categorySlug: searchParams.categorySlug,
    featured: searchParams.featured === 'true' ? true : undefined,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    sortBy,
    page,
    limit: 12,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {searchParams.search ? `Results for "${searchParams.search}"` : 'All Products'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{total} products</p>
        </div>
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((cat) => {
          const active = cat.slug === (searchParams.categorySlug ?? undefined)
          const href = cat.slug ? `/products?categorySlug=${cat.slug}` : '/products'
          return (
            <Link
              key={cat.name}
              href={href}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </Link>
          )
        })}
        <Suspense>
          <SortSelect defaultValue={sortBy} />
        </Suspense>
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="mt-20 text-center text-gray-400">
          <p className="text-lg">No products found.</p>
          <Link href="/products" className="mt-2 text-sm text-indigo-600 hover:underline">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={{ ...p, price: Number(p.price), stock: p.stock }} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams(searchParams as Record<string, string>)
            params.set('page', String(p))
            return (
              <Link
                key={p}
                href={`/products?${params.toString()}`}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition ${
                  p === page
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
                }`}
              >
                {p}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
