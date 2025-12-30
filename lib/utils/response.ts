/**
 * Check if a response is incomplete (cut off mid-sentence, incomplete code blocks, etc.)
 */
export function isResponseIncomplete(content: string): boolean {
  if (!content || content.trim().length === 0) return false
  
  const trimmed = content.trim()
  
  // Check for incomplete code blocks (unclosed ```)
  const codeBlockMatches = trimmed.match(/```/g)
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
    return true // Odd number of ``` means unclosed code block
  }
  
  // Check for incomplete markdown lists (ends with - or * without content)
  if (/[-*]\s*$/.test(trimmed)) {
    return true
  }
  
  // Check if ends mid-sentence (no punctuation, not ending with common endings)
  const lastChar = trimmed[trimmed.length - 1]
  const sentenceEndings = ['.', '!', '?', '\n']
  if (!sentenceEndings.includes(lastChar)) {
    // Check if it's a complete word (ends with space or punctuation)
    const lastWord = trimmed.split(/\s+/).pop() || ''
    // If last "word" is very long or contains no letters, might be incomplete
    if (lastWord.length > 50 || !/[a-zA-Z]/.test(lastWord)) {
      return true
    }
    // If ends without space and last char is a letter, might be cut off
    if (/[a-zA-Z]$/.test(trimmed) && trimmed.length > 100) {
      return true
    }
  }
  
  return false
}

