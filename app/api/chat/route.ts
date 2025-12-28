import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { openRouterChatStream } from '@/lib/openrouter'

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

    // Convert history to chat completion format
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
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

    // Create streaming response using OpenRouter API directly
    const stream = await openRouterChatStream(messages, { temperature: 0.7 })

    // Process the SSE stream from OpenRouter
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const readable = new ReadableStream({
      async start(controller) {
        // Helper function to safely enqueue data
        const safeEnqueue = (data: Uint8Array) => {
          try {
            // Check if controller is still open before enqueueing
            if (controller.desiredSize !== null) {
              controller.enqueue(data)
            }
          } catch (error: any) {
            // Ignore errors if controller is already closed (e.g., request aborted)
            if (error?.name !== 'InvalidStateError' && error?.code !== 'ERR_INVALID_STATE') {
              throw error
            }
          }
        }

        // Helper function to safely close controller
        const safeClose = () => {
          try {
            if (controller.desiredSize !== null) {
              controller.close()
            }
          } catch (error: any) {
            // Ignore errors if controller is already closed
            if (error?.name !== 'InvalidStateError' && error?.code !== 'ERR_INVALID_STATE') {
              throw error
            }
          }
        }

        let reader: ReadableStreamDefaultReader<Uint8Array> | null = null
        try {
          reader = stream.getReader()
          let buffer = ''

          while (true) {
            // Check if request was aborted
            if (req.signal?.aborted) {
              break
            }

            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              // Check again before processing each line
              if (req.signal?.aborted) {
                break
              }

              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  safeEnqueue(encoder.encode('data: [DONE]\n\n'))
                  continue
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content || ''
                  if (content) {
                    const data = `data: ${JSON.stringify({ content })}\n\n`
                    safeEnqueue(encoder.encode(data))
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }

          // Process remaining buffer only if not aborted
          if (!req.signal?.aborted && buffer.trim()) {
            const lines = buffer.split('\n')
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  safeEnqueue(encoder.encode('data: [DONE]\n\n'))
                } else {
                  try {
                    const parsed = JSON.parse(data)
                    const content = parsed.choices?.[0]?.delta?.content || ''
                    if (content) {
                      const data = `data: ${JSON.stringify({ content })}\n\n`
                      safeEnqueue(encoder.encode(data))
                    }
                  } catch (e) {
                    // Ignore parse errors
                  }
                }
              }
            }
          }

          // Only send final [DONE] and close if not aborted
          if (!req.signal?.aborted) {
            safeEnqueue(encoder.encode('data: [DONE]\n\n'))
            safeClose()
          }
        } catch (error: any) {
          // Ignore abort errors
          if (error?.name === 'AbortError' || req.signal?.aborted) {
            return
          }
          console.error('Streaming error:', error)
          try {
            controller.error(error)
          } catch (e) {
            // Controller might already be closed
          }
        } finally {
          // Ensure reader is released
          if (reader) {
            try {
              reader.releaseLock()
            } catch (e) {
              // Reader might already be released
            }
          }
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
    const statusCode = errorMessage.includes('OPENROUTER_API_KEY') ? 503 : 500
    return new Response(
      JSON.stringify({ 
        error: errorMessage.includes('OPENROUTER_API_KEY') 
          ? 'OpenRouter API key is not configured. Please set OPENROUTER_API_KEY environment variable.'
          : 'Internal server error' 
      }),
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

