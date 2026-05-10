import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — ShopFlow SA' }

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/" className="text-sm text-indigo-600 hover:underline">← Back to ShopFlow</Link>

      <h1 className="mt-4 text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-ZA', { dateStyle: 'long' })}</p>

      <div className="mt-8 space-y-8 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Who we are</h2>
          <p>ShopFlow SA operates this marketplace connecting consumers with South African street vendors. We are subject to the <strong>Protection of Personal Information Act 4 of 2013 (POPIA)</strong>.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Personal information we collect</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Name, email address, and phone number when you register or check out</li>
            <li>Delivery address or GPS coordinates for order fulfilment</li>
            <li>Payment reference numbers (we never store card details)</li>
            <li>Order history and product browsing behaviour</li>
            <li>Device type and approximate location (for vendor discovery)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">3. How we use your information</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>To process and fulfil your orders</li>
            <li>To send order confirmations and shipping updates via email and SMS</li>
            <li>To show you nearby vendors and in-season produce</li>
            <li>To improve the platform and prevent fraud</li>
          </ul>
          <p className="mt-2">We do <strong>not</strong> sell your personal information to third parties.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Sharing with third parties</h2>
          <p>We share data only where necessary for the service:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Payment processors</strong> — PayFast, Ozow, Stripe (each under their own POPIA-compliant policies)</li>
            <li><strong>Delivery partners</strong> — Pudo, The Courier Guy, Aramex SA (for address fulfilment only)</li>
            <li><strong>SMS gateway</strong> — BulkSMS SA (phone number only, for order notifications)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Your rights under POPIA</h2>
          <p>You have the right to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Access</strong> the personal information we hold about you</li>
            <li><strong>Correct</strong> inaccurate information</li>
            <li><strong>Delete</strong> your account and associated data</li>
            <li><strong>Object</strong> to processing for marketing purposes</li>
            <li><strong>Complain</strong> to the Information Regulator of South Africa</li>
          </ul>
          <p className="mt-2">To exercise any of these rights, email us at <strong>privacy@shopflow.co.za</strong>. We will respond within 30 days as required by POPIA.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Cookies</h2>
          <p>We use strictly necessary cookies to keep you signed in and remember your cart. We do not use third-party advertising cookies. You may clear cookies at any time in your browser settings.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Data retention</h2>
          <p>Order records are retained for 5 years for SARS compliance. Account data is deleted within 30 days of account closure on request.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Security</h2>
          <p>We use TLS encryption in transit, hashed passwords (bcrypt), and access-controlled databases. Payment details are handled entirely by PCI-DSS certified gateways — we never see your card number.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Contact & complaints</h2>
          <p>Information Officer: <strong>privacy@shopflow.co.za</strong></p>
          <p className="mt-1">Information Regulator of South Africa: <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">inforegulator.org.za</a></p>
        </section>
      </div>
    </div>
  )
}
