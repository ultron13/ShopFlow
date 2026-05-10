import { notFound } from 'next/navigation'
import Image from 'next/image'
import { api } from '@/lib/trpc-server'
import { formatPrice } from '@/lib/utils'
import { ProductCard } from '@/components/store/product-card'
import { AddToCartSection } from '@/components/store/add-to-cart-section'
import { ReviewForm } from '@/components/store/review-form'
import { StarRating } from '@/components/store/star-rating'
import { formatDate } from '@/lib/utils'
import { ShieldCheck, Truck } from 'lucide-react'
import type { Metadata } from 'next'

export const revalidate = 300

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const product = await api.products.bySlug.query({ slug })
    return {
      title: product.name,
      description: product.description.slice(0, 160),
      openGraph: { images: product.images[0] ? [product.images[0]] : [] },
    }
  } catch {
    return { title: 'Product not found' }
  }
}

export default async function ProductPage({ params: paramsPromise }: Props) {
  const { slug } = await paramsPromise
  let product
  try {
    product = await api.products.bySlug.query({ slug })
  } catch {
    notFound()
  }

  const related = await api.products.related.query({
    categoryId: product.categoryId,
    excludeId: product.id,
  })

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex gap-2 text-sm text-gray-400">
        <a href="/products" className="hover:text-gray-700">Products</a>
        <span>/</span>
        <a href={`/products?categorySlug=${product.category.slug}`} className="hover:text-gray-700">
          {product.category.name}
        </a>
        <span>/</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src={product.images[0] ?? '/placeholder.png'}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.slice(1).map((img, i) => (
                <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
                  <Image src={img} alt={`${product.name} ${i + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm font-medium text-indigo-600">{product.category.name}</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <StarRating value={Math.round(avgRating)} size="sm" />
              <span className="text-sm text-gray-500">
                {product._count.reviews} review{product._count.reviews !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(Number(product.price))}</span>
            {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(Number(product.comparePrice))}
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          <AddToCartSection product={product} />

          <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck className="h-4 w-4 text-indigo-500" />
              Free shipping on orders over $50
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
              Secure Stripe checkout
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {product.reviews.length === 0 && (
              <p className="text-gray-400">No reviews yet. Be the first!</p>
            )}
            {product.reviews.map((review) => (
              <div key={review.id} className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.user.name ?? 'Anonymous'}</span>
                    {review.verified && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                </div>
                <StarRating value={review.rating} size="sm" />
                {review.title && <p className="mt-2 font-medium">{review.title}</p>}
                {review.body && <p className="mt-1 text-sm text-gray-600">{review.body}</p>}
              </div>
            ))}
          </div>
          <div>
            <ReviewForm productId={product.id} />
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-gray-900">You Might Also Like</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={{ ...p, price: Number(p.price) }} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
