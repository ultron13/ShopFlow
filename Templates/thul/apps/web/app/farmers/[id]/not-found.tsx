import Link from 'next/link'

export default function FarmerNotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-4xl mb-4">🌾</p>
      <h1 className="text-xl font-bold text-gray-900">Farmer not found</h1>
      <p className="mt-2 text-sm text-gray-500">
        This farmer profile doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/farmers"
        className="mt-6 inline-block rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
      >
        Browse all farmers
      </Link>
    </div>
  )
}
