import crypto from 'crypto'

function buildSignatureString(params: Record<string, string>, passphrase?: string): string {
  const str = Object.entries(params)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, '+')}`)
    .join('&')
  return passphrase
    ? `${str}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
    : str
}

function sign(params: Record<string, string>, passphrase?: string): string {
  return crypto.createHash('md5').update(buildSignatureString(params, passphrase)).digest('hex')
}

export interface PayfastPaymentResult {
  url: string
  params: Record<string, string>
}

export function buildPayfastPayment(params: {
  orderId: string
  amount: number
  itemName: string
  email?: string
  returnUrl: string
  cancelUrl: string
  notifyUrl: string
}): PayfastPaymentResult {
  const merchantId = process.env['PAYFAST_MERCHANT_ID'] ?? ''
  const merchantKey = process.env['PAYFAST_MERCHANT_KEY'] ?? ''
  const passphrase = process.env['PAYFAST_PASSPHRASE']
  const sandbox = process.env['PAYFAST_SANDBOX'] !== 'false'

  const formParams: Record<string, string> = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: params.returnUrl,
    cancel_url: params.cancelUrl,
    notify_url: params.notifyUrl,
    m_payment_id: params.orderId,
    amount: params.amount.toFixed(2),
    item_name: params.itemName.slice(0, 100),
  }
  if (params.email) formParams['email_address'] = params.email

  formParams['signature'] = sign(formParams, passphrase)

  const baseUrl = sandbox
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process'

  return { url: baseUrl, params: formParams }
}

export function verifyPayfastSignature(
  params: Record<string, string>,
  passphrase?: string
): boolean {
  const { signature, ...rest } = params
  const computed = sign(rest, passphrase ?? process.env['PAYFAST_PASSPHRASE'])
  return computed === signature
}
