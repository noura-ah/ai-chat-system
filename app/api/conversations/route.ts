import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getOrCreateUser } from '@/lib/user'

// Get all conversations for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 })
    }

    const user = await getOrCreateUser(session)

    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1, // Only get first message for title
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            content: true,
          },
        },
      },
    })

    return Response.json({ conversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

// Create a new conversation
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { title } = await req.json()

    const user = await getOrCreateUser(session)

    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: title || null,
        // Mode is not stored on conversation - it's derived from messages
      },
      include: {
        messages: true,
      },
    })

    return Response.json({ conversation })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

