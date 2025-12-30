/**
 * Calculate dynamic max_tokens based on message length
 * Formula: min(500 + messageLength / 2, 1500)
 */
export function calculateMaxTokens(messageLength: number): number {
  return Math.min(500 + Math.floor(messageLength / 2), 1500)
}

