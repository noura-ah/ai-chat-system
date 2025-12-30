// TextEncoder and TextDecoder are available globally in Node.js

/**
 * Helper function to safely enqueue data to a ReadableStream controller
 */
export function safeEnqueue(
  controller: ReadableStreamDefaultController<Uint8Array>,
  data: Uint8Array
): void {
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

/**
 * Helper function to safely close a ReadableStream controller
 */
export function safeClose(controller: ReadableStreamDefaultController<Uint8Array>): void {
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

interface ProcessStreamOptions {
  stream: ReadableStream<Uint8Array>
  accumulatedContent: { value: string }
  controller: ReadableStreamDefaultController<Uint8Array>
  abortSignal?: AbortSignal
}

/**
 * Process a single SSE data line and forward content to controller
 */
function processSSELine(
  line: string,
  accumulatedContent: { value: string },
  controller: ReadableStreamDefaultController<Uint8Array>
): void {
  if (!line.startsWith('data: ')) {
    return
  }

  const data = line.slice(6)
  if (data === '[DONE]') {
    return
  }

  try {
    const parsed = JSON.parse(data)
    const content = parsed.choices?.[0]?.delta?.content || ''
    if (content) {
      const encoder = new TextEncoder()
      accumulatedContent.value += content
      const sseData = `data: ${JSON.stringify({ content })}\n\n`
      safeEnqueue(controller, encoder.encode(sseData))
    }
  } catch (e) {
    // Ignore parse errors
  }
}

/**
 * Process lines from a buffer and update the buffer with remaining content
 */
function processBufferLines(
  buffer: string,
  accumulatedContent: { value: string },
  controller: ReadableStreamDefaultController<Uint8Array>,
  abortSignal?: AbortSignal
): string {
  const lines = buffer.split('\n')
  const remainingBuffer = lines.pop() || ''

  for (const line of lines) {
    if (abortSignal?.aborted) {
      break
    }
    processSSELine(line, accumulatedContent, controller)
  }

  return remainingBuffer
}

/**
 * Process a stream and accumulate content, forwarding chunks to the controller
 */
export async function processStream({
  stream,
  accumulatedContent,
  controller,
  abortSignal,
}: ProcessStreamOptions): Promise<void> {
  const decoder = new TextDecoder()
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null
  
  try {
    reader = stream.getReader()
    let buffer = ''

    while (true) {
      if (abortSignal?.aborted) {
        break
      }

      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      buffer = processBufferLines(buffer, accumulatedContent, controller, abortSignal)
    }

    // Process remaining buffer only if not aborted
    if (!abortSignal?.aborted && buffer.trim()) {
      processBufferLines(buffer, accumulatedContent, controller, abortSignal)
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
}

