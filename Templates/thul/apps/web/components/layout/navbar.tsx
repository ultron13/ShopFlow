'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, User, Search, Package, Menu, X, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/lib/cart-store'
import { CartSidebar } from '@/components/store/cart-sidebar'
import { LanguageSelector } from '@/components/language-selector'
import { useI18n } from '@/lib/i18n'

function useDataLight() {
  const [on, setOn] = useState(false)
  useEffect(() => {
    setOn(localStorage.getItem('data-light') === '1')
  }, [])
  function toggle() {
    const next = !on
    setOn(next)
    localStorage.setItem('data-light', next ? '1' : '0')
    document.documentElement.classList.toggle('data-light', next)
  }
  return { on, toggle }
}

export function Navbar() {
  const { data: session } = useSession()
  const { t } = useI18n()
  const count = useCartStore((s) => s.count())
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const dataLight = useDataLight()

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
            <Package className="h-6 w-6" />
            ShopFlow
          </Link>

          <div className="hidden gap-5 md:flex items-center">
            <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">{t.nav.products}</Link>
            <Link href="/vendors"  className="text-sm font-medium text-gray-600 hover:text-gray-900">{t.nav.vendors}</Link>
            <Link href="/farmers"  className="text-sm font-medium text-green-700 hover:text-green-900">🌱 Farmers</Link>
            <Link href="/map"      className="text-sm font-medium text-gray-600 hover:text-gray-900">🗺️ Map</Link>
            <Link href="/seasonal" className="text-sm font-medium text-gray-600 hover:text-gray-900">{t.nav.seasonal}</Link>
            <Link href="/stokvel"  className="text-sm font-medium text-indigo-600 hover:text-indigo-800">🤝 {t.nav.stokvel}</Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <LanguageSelector />
              <button
                onClick={dataLight.toggle}
                title={dataLight.on ? t.dataLight.on : t.dataLight.off}
                className={`rounded-lg p-1.5 text-xs font-medium transition ${dataLight.on ? 'bg-yellow-100 text-yellow-700' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <Zap className="h-4 w-4" />
              </button>
            </div>
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
              {[`${t.nav.products}:/products`, `${t.nav.vendors}:/vendors`, `🌱 Farmers:/farmers`, `🗺️ Map:/map`, `${t.nav.seasonal}:/seasonal`, `🤝 ${t.nav.stokvel}:/stokvel`].map((item) => {
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
