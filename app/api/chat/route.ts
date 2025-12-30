import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { openRouterChatStream } from '@/lib/openrouter'
import { isResponseIncomplete } from '@/lib/utils/response'
import { calculateMaxTokens } from '@/lib/utils/tokens'
import { processStream, safeEnqueue, safeClose } from '@/lib/utils/stream'
import { buildMessages, buildContinuationMessages, CHAT_TEMPERATURE, MAX_CONTINUATIONS } from '@/lib/utils/messages'

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

    // Build messages from history
    const messages = buildMessages(history)

    // Calculate dynamic max_tokens based on last user message length
    const maxTokens = calculateMaxTokens(message.length)
    
    // Create streaming response using OpenRouter API directly
    const stream = await openRouterChatStream(messages, { 
      temperature: CHAT_TEMPERATURE,
      max_tokens: maxTokens
    })

    // Process the SSE stream from OpenRouter
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {

        try {
          const accumulatedContent = { value: '' }
          
          // Process the initial stream
          await processStream({
            stream,
            accumulatedContent,
            controller,
            abortSignal: req.signal,
          })

          // Check if response is incomplete and continue if needed
          let continuationCount = 0
          
          while (
            !req.signal?.aborted &&
            isResponseIncomplete(accumulatedContent.value) &&
            continuationCount < MAX_CONTINUATIONS
          ) {
            continuationCount++
            
            // Build continuation messages with accumulated content
            const continuationMessages = buildContinuationMessages(messages, accumulatedContent.value)

            // Get continuation stream (reuse maxTokens from initial request)
            const continuationStream = await openRouterChatStream(continuationMessages, {
              temperature: CHAT_TEMPERATURE,
              max_tokens: maxTokens,
            })

            // Process continuation stream
            await processStream({
              stream: continuationStream,
              accumulatedContent,
              controller,
              abortSignal: req.signal,
            })
          }

          // Only send final [DONE] and close if not aborted
          if (!req.signal?.aborted) {
            safeEnqueue(controller, encoder.encode('data: [DONE]\n\n'))
            safeClose(controller)
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

