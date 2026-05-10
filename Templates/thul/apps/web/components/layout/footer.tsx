import Link from 'next/link'
import { Package } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-indigo-600">
              <Package className="h-5 w-5" />
              ShopFlow
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              Premium products curated for modern living.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Shop</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href="/products" className="hover:text-gray-900">All Products</Link></li>
              <li><Link href="/products?categorySlug=electronics" className="hover:text-gray-900">Electronics</Link></li>
              <li><Link href="/products?categorySlug=clothing" className="hover:text-gray-900">Clothing</Link></li>
              <li><Link href="/products?categorySlug=home-kitchen" className="hover:text-gray-900">Home & Kitchen</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href="/sign-in" className="hover:text-gray-900">Sign In</Link></li>
              <li><Link href="/sign-up" className="hover:text-gray-900">Create Account</Link></li>
              <li><Link href="/account/orders" className="hover:text-gray-900">Order History</Link></li>
              <li><Link href="/account/wishlist" className="hover:text-gray-900">Wishlist</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Support</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href="/faq" className="hover:text-gray-900">FAQ</Link></li>
              <li><Link href="/returns" className="hover:text-gray-900">Returns</Link></li>
              <li><Link href="/shipping" className="hover:text-gray-900">Shipping Info</Link></li>
              <li><a href="mailto:support@shopflow.dev" className="hover:text-gray-900">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} ShopFlow. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
