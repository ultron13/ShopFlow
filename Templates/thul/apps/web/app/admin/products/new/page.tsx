'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function NewProductPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', stock: '',
    categoryId: '', images: '', featured: false,
  })

  const { data: categories } = trpc.products.list.useQuery({ limit: 50 })

  const create = trpc.products.create.useMutation({
    onSuccess() {
      toast.success('Product created!')
      router.push('/admin/products')
    },
    onError(err) { toast.error(err.message) },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    create.mutate({
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId: form.categoryId,
      images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
      featured: form.featured,
    })
  }

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        required
        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
    </div>
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-xl border bg-white p-6">
        {field('Name', 'name')}
        {field('Slug', 'slug')}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={4}
            required
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {field('Price ($)', 'price', 'number')}
          {field('Stock', 'stock', 'number')}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Image URLs (one per line)</label>
          <textarea
            value={form.images}
            onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
            rows={3}
            required
            placeholder="https://..."
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            required
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">Select category…</option>
            {categories?.products.map((p) => p.category).filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i).map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />
          Featured product
        </label>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={create.isPending}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            {create.isPending ? 'Creating…' : 'Create Product'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="rounded-lg border px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
