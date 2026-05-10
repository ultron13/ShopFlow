'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, User, Search, Package, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/lib/cart-store'
import { CartSidebar } from '@/components/store/cart-sidebar'

export function Navbar() {
  const { data: session } = useSession()
  const count = useCartStore((s) => s.count())
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
            <Package className="h-6 w-6" />
            ShopFlow
          </Link>

          <div className="hidden gap-6 md:flex">
            <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              All Products
            </Link>
            <Link href="/products?categorySlug=electronics" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Electronics
            </Link>
            <Link href="/products?categorySlug=clothing" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Clothing
            </Link>
            <Link href="/products?categorySlug=home-kitchen" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Home & Kitchen
            </Link>
            <Link href="/stokvel" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
              🤝 Stokvel
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/products"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>

            {session ? (
              <div className="relative group">
                <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900">
                  <User className="h-5 w-5" />
                </button>
                <div className="absolute right-0 top-full mt-1 hidden w-44 rounded-xl border bg-white py-1 shadow-lg group-hover:block">
                  <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Account</Link>
                  <Link href="/account/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Orders</Link>
                  <Link href="/account/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Wishlist</Link>
                  {(session.user as { role?: string }).role === 'ADMIN' && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-indigo-600 hover:bg-gray-50">Admin Panel</Link>
                  )}
                  <hr className="my-1" />
                  <button
                    onClick={() => signOut()}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Sign in
              </Link>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>

            <button
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="border-t bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-3">
              {['All Products:/products', 'Electronics:/products?categorySlug=electronics', 'Clothing:/products?categorySlug=clothing', 'Home & Kitchen:/products?categorySlug=home-kitchen', '🤝 Stokvel:/stokvel'].map((item) => {
                const [label, href] = item.split(':') as [string, string]
                return (
                  <Link key={href} href={href} className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </header>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
