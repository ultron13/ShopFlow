import type { PrismaClient } from '@shopflow/db'
import crypto from 'crypto'

export async function verifyToken(token: string, prisma: PrismaClient) {
  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: true },
  })
  if (!session || session.expires < new Date()) return null
  return session.user
}

export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex')
}
