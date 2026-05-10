import { Resend } from 'resend'

const resend = new Resend(process.env['RESEND_API_KEY'])
const FROM = process.env['EMAIL_FROM'] ?? 'orders@shopflow.dev'

interface OrderConfirmationParams {
  to: string
  orderNumber: string
  items: { name: string; qty: number; price: number }[]
  total: number
}

export async function sendOrderConfirmation(params: OrderConfirmationParams) {
  const itemsHtml = params.items
    .map((i) => `<tr><td>${i.name}</td><td>${i.qty}</td><td>$${i.price.toFixed(2)}</td></tr>`)
    .join('')

  return resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Order Confirmed — #${params.orderNumber}`,
    html: `
      <h2>Thanks for your order!</h2>
      <p>Order <strong>#${params.orderNumber}</strong> has been confirmed.</p>
      <table border="1" cellpadding="8" style="border-collapse:collapse">
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p><strong>Total: $${params.total.toFixed(2)}</strong></p>
      <p>We'll email you when your order ships.</p>
    `,
  })
}

export async function sendShippingNotification(params: {
  to: string
  orderNumber: string
  trackingNumber: string
  carrier: string
}) {
  return resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Your order #${params.orderNumber} has shipped!`,
    html: `
      <h2>Your order is on the way!</h2>
      <p>Carrier: <strong>${params.carrier}</strong></p>
      <p>Tracking: <strong>${params.trackingNumber}</strong></p>
    `,
  })
}
