export async function sendSms(to: string, message: string): Promise<void> {
  const token = process.env['BULKSMS_API_TOKEN']
  if (!token) {
    console.warn('⚠️  BULKSMS_API_TOKEN not set — SMS not sent to', to)
    return
  }

  // Normalise to +27 international format
  const normalised = to.startsWith('0') ? `+27${to.slice(1)}` : to

  const res = await fetch('https://api.bulksms.com/v1/messages', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to: normalised, body: message }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('BulkSMS error:', err)
  }
}

export function orderConfirmedSms(orderNumber: string, total: number): string {
  return `ShopFlow: Order #${orderNumber} confirmed! Total: R${total.toFixed(2)}. We'll notify you when it ships.`
}

export function orderShippedSms(orderNumber: string): string {
  return `ShopFlow: Order #${orderNumber} is on its way! Track your order at shopflow.co.za/account/orders`
}
