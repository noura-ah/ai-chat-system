import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Get a specific conversation with messages
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new Response('User not found', { status: 404 })
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            searchResults: true,
            images: true,
          },
        },
      },
    })

    if (!conversation) {
      return new Response('Conversation not found', { status: 404 })
    }

    return Response.json({ conversation })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

// Delete a conversation
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new Response('User not found', { status: 404 })
    }

    await prisma.conversation.deleteMany({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

