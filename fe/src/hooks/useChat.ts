import { useState } from 'react'
import type { Message } from '../types/chat'
import { subscribeToChat } from '../api/chat'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  async function send(text: string) {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: text },
    ])
    setLoading(true)

    const assistantId = crypto.randomUUID()
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '' },
    ])

    try {
      await subscribeToChat(text, (chunk) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: msg.content + chunk } : msg,
          ),
        )
      })
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: `Error: ${(err as Error).message}` }
            : msg,
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  return { messages, loading, send }
}
