import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Message } from '@/types/chat'

// Save a message to the database
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 })
    }

    const requestData: Omit<Message, 'id' | 'timestamp'> & { conversationId: string } = await req.json()
    
    const { conversationId, role, content, mode, searchResults, images } = requestData
    
    if (!conversationId) {
      return new Response('conversationId is required', { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new Response('User not found', { status: 404 })
    }

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: user.id,
      },
    })

    if (!conversation) {
      return new Response('Conversation not found', { status: 404 })
    }

    // Check if this will be the first user message
    const existingUserMessages = await prisma.message.count({
      where: {
        conversationId,
        role: 'user',
      },
    })

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        role,
        content,
        mode: mode || null,
        searchResults: searchResults
          ? {
              create: searchResults.map((result) => ({
                title: result.title,
                link: result.link,
                snippet: result.snippet,
              })),
            }
          : undefined,
        images: images
          ? {
              create: images.map((img) => ({
                url: img.url,
                title: img.title || null,
              })),
            }
          : undefined,
      },
      include: {
        searchResults: true,
        images: true,
      },
    })

    // Update conversation: set title from first user message if not set
    const updateData: { updatedAt: Date; title?: string } = {
      updatedAt: new Date(),
    }

    // If this is the first user message and conversation has no title, set it
    if (role === 'user' && !conversation.title && existingUserMessages === 0) {
      updateData.title = content.substring(0, 100) + (content.length > 100 ? '...' : '')
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: updateData,
    })

    // Convert to Message type
    const messageResponse: Message = {
      id: message.id,
      conversationId: message.conversationId,
      role: message.role as 'user' | 'assistant',
      content: message.content,
      timestamp: message.createdAt,
      mode: message.mode as 'chat' | 'search' | undefined,
      searchResults: message.searchResults.map((r) => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet,
      })),
      images: message.images.map((img) => ({
        url: img.url,
        title: img.title || undefined,
      })),
    }

    return Response.json({ message: messageResponse })
  } catch (error) {
    console.error('Error saving message:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

