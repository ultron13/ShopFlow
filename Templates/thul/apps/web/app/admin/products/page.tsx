import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { api } from '@/lib/trpc-server'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil } from 'lucide-react'

export default async function AdminProductsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') redirect('/')

  const searchParams = await searchParamsPromise
  const page = Number(searchParams.page ?? '1')
  const { products, total, pages } = await api.products.list.query({ page, limit: 20 })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="mt-6 rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Product</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Price</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Stock</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 flex items-center gap-3">
                  {product.images[0] && (
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gray-100 flex-none">
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    </div>
                  )}
                  <span className="font-medium text-gray-800 line-clamp-2">{product.name}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{product.category.name}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(Number(product.price))}</td>
                <td className="px-4 py-3">
                  <span className={product.stock <= 5 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${product.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {product.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${product.id}`} className="text-indigo-600 hover:text-indigo-800">
                    <Pencil className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/products?page=${p}`}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${
                p === page ? 'bg-indigo-600 text-white' : 'border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
