import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'
import { getOpenAIClient } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { message, history } = await req.json()

    if (!message || typeof message !== 'string') {
      return new Response('Message is required', { status: 400 })
    }

    // Convert history to OpenAI format
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          'You are a helpful AI assistant. Provide clear, concise, and accurate responses.',
      },
    ]

    // Add conversation history
    if (Array.isArray(history)) {
      history.forEach((msg: { role: string; content: string }) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })
        }
      })
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    })

    // Create streaming response
    const openai = getOpenAIClient()
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      stream: true,
      temperature: 0.7,
    })

    // Create a readable stream
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              const data = `data: ${JSON.stringify({ content })}\n\n`
              controller.enqueue(encoder.encode(data))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    const statusCode = errorMessage.includes('OPENAI_API_KEY') ? 503 : 500
    return new Response(
      JSON.stringify({ 
        error: errorMessage.includes('OPENAI_API_KEY') 
          ? 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.'
          : 'Internal server error' 
      }),
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

