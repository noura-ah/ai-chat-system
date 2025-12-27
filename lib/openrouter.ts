/**
 * Get the configured OpenRouter model
 * Defaults to 'openai/gpt-4o-mini' if not specified
 */
export function getOpenRouterModel(): string {
  return process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'
}

/**
 * Get OpenRouter API headers
 */
function getOpenRouterHeaders(): Record<string, string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('OPENROUTER_API_KEY environment variable is not configured')
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey.trim()}`,
    'Content-Type': 'application/json',
  }

  // Add optional headers if provided
  if (process.env.OPENROUTER_REFERER_URL) {
    headers['HTTP-Referer'] = process.env.OPENROUTER_REFERER_URL
  }
  if (process.env.OPENROUTER_APP_NAME) {
    headers['X-Title'] = process.env.OPENROUTER_APP_NAME
  }

  return headers
}

/**
 * Handle OpenRouter API errors with helpful messages
 */
function handleOpenRouterError(response: Response, errorText: string): never {
  let errorMessage = `OpenRouter API error: ${response.status}`
  
  try {
    const errorJson = JSON.parse(errorText)
    errorMessage = errorJson.error?.message || errorText
  } catch {
    errorMessage = errorText || errorMessage
  }
  
  // Provide helpful error message for 401
  if (response.status === 401) {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is not set. Please configure it in your .env file.')
    }
    throw new Error(`OpenRouter authentication failed: ${errorMessage}. Please check that your OPENROUTER_API_KEY is correct.`)
  }
  
  // Handle data policy/privacy configuration errors
  if (errorMessage.includes('data policy') || errorMessage.includes('privacy') || errorMessage.includes('No endpoints found')) {
    throw new Error(
      `OpenRouter data policy configuration required: ${errorMessage}\n` +
      `Please configure your privacy settings at https://openrouter.ai/settings/privacy`
    )
  }
  
  throw new Error(errorMessage)
}

/**
 * Base function to make requests to OpenRouter API
 */
async function openRouterRequest(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: {
    stream: boolean
    temperature?: number
    max_tokens?: number
  }
): Promise<Response> {
  const model = getOpenRouterModel()
  const headers = getOpenRouterHeaders()
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      stream: options.stream,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    handleOpenRouterError(response, errorText)
  }

  return response
}

/**
 * Make a non-streaming request to OpenRouter API
 */
export async function openRouterChatCompletion(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: { temperature?: number; max_tokens?: number }
) {
  const response = await openRouterRequest(messages, {
    stream: false,
    temperature: options?.temperature,
    max_tokens: options?.max_tokens,
  })
  return await response.json()
}

/**
 * Make a streaming request to OpenRouter API
 * Returns a ReadableStream of the response
 */
export async function openRouterChatStream(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: { temperature?: number }
): Promise<ReadableStream<Uint8Array>> {
  const response = await openRouterRequest(messages, {
    stream: true,
    temperature: options?.temperature,
  })

  if (!response.body) {
    throw new Error('OpenRouter API returned no response body')
  }

  return response.body
}

