import { Session } from 'next-auth'
import { prisma } from './db'

/**
 * Get or create a user from the session
 */
export async function getOrCreateUser(session: Session) {
  if (!session.user?.email) {
    throw new Error('User email is required')
  }

  return await prisma.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.name || null,
      image: session.user.image || null,
    },
  })
}

