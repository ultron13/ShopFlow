import crypto from 'crypto'

function sha512(str: string): string {
  return crypto.createHash('sha512').update(str).digest('hex')
}

export function buildOzowPayment(params: {
  orderId: string
  amount: number
  cancelUrl: string
  errorUrl: string
  successUrl: string
  notifyUrl: string
}): string {
  const siteCode = process.env['OZOW_SITE_CODE'] ?? ''
  const privateKey = process.env['OZOW_PRIVATE_KEY'] ?? ''
  const isTest = process.env['OZOW_SANDBOX'] !== 'false' ? 'true' : 'false'

  const amountStr = params.amount.toFixed(2)
  const bankRef = params.orderId.slice(-20)

  // Hash input: all values concatenated (lowercase) + private key
  const hashInput = [
    siteCode,
    'ZA',
    'ZAR',
    amountStr,
    params.orderId,
    bankRef,
    params.cancelUrl,
    params.errorUrl,
    params.successUrl,
    isTest,
    privateKey,
  ]
    .join('')
    .toLowerCase()

  const hash = sha512(hashInput)

  const url = new URL('https://pay.ozow.com/')
  url.searchParams.set('SiteCode', siteCode)
  url.searchParams.set('CountryCode', 'ZA')
  url.searchParams.set('CurrencyCode', 'ZAR')
  url.searchParams.set('Amount', amountStr)
  url.searchParams.set('TransactionReference', params.orderId)
  url.searchParams.set('BankRef', bankRef)
  url.searchParams.set('CancelUrl', params.cancelUrl)
  url.searchParams.set('ErrorUrl', params.errorUrl)
  url.searchParams.set('SuccessUrl', params.successUrl)
  url.searchParams.set('NotifyUrl', params.notifyUrl)
  url.searchParams.set('IsTest', isTest)
  url.searchParams.set('HashCheck', hash)

  return url.toString()
}

export function verifyOzowHash(body: Record<string, string>): boolean {
  const { HashCheck, ...rest } = body
  if (!HashCheck) return false

  const privateKey = process.env['OZOW_PRIVATE_KEY'] ?? ''
  const vals = Object.values(rest).join('').toLowerCase() + privateKey.toLowerCase()
  const computed = sha512(vals)
  return computed.toLowerCase() === HashCheck.toLowerCase()
}
