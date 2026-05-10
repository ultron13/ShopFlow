import Link from 'next/link'
import { Sprout } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-green-700">
              <Sprout className="h-5 w-5" />
              Thul
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              Connecting South African farmers and street vendors directly with buyers across all 9 provinces.
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Marketplace</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href="/farmers"  className="hover:text-gray-900">Find Farmers</Link></li>
              <li><Link href="/vendors"  className="hover:text-gray-900">Find Vendors</Link></li>
              <li><Link href="/map"      className="hover:text-gray-900">Interactive Map</Link></li>
              <li><Link href="/seasonal" className="hover:text-gray-900">Seasonal Produce</Link></li>
              <li><Link href="/stokvel"  className="hover:text-gray-900">Stokvel Group Buying</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href="/sign-in"           className="hover:text-gray-900">Sign In</Link></li>
              <li><Link href="/sign-up"            className="hover:text-gray-900">Create Account</Link></li>
              <li><Link href="/account/orders"     className="hover:text-gray-900">Order History</Link></li>
              <li><Link href="/account/wishlist"   className="hover:text-gray-900">Wishlist</Link></li>
              <li><Link href="/vendor/dashboard"   className="hover:text-gray-900">Register as Farmer / Vendor</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href="/privacy" className="hover:text-gray-900">Privacy Policy (POPIA)</Link></li>
              <li><a href="mailto:support@thul.co.za" className="hover:text-gray-900">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Thul. Supporting South African farmers and informal traders.
        </div>
      </div>
    </footer>
  )
}
