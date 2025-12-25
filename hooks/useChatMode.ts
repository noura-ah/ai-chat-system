import { useState, useEffect } from 'react'

export function useChatMode() {
  const [mode, setMode] = useState<'chat' | 'search'>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('chatMode')
      return (savedMode === 'chat' || savedMode === 'search') ? savedMode : 'chat'
    }
    return 'chat'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatMode', mode)
    }
  }, [mode])

  return [mode, setMode] as const
}

