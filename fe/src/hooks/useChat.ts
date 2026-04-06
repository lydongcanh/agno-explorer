import { useState } from 'react'
import type { Message, ToolStep } from '../types/chat'
import { subscribeToChat } from '../api/chat'

function appendContent(msgs: Message[], id: string, chunk: string): Message[] {
  return msgs.map((m) => (m.id === id ? { ...m, content: m.content + chunk } : m))
}

function addStep(msgs: Message[], id: string, step: ToolStep): Message[] {
  return msgs.map((m) => (m.id === id ? { ...m, steps: [...m.steps, step] } : m))
}

function completeStep(msgs: Message[], id: string, toolName: string, result: string): Message[] {
  return msgs.map((m) => {
    if (m.id !== id) return m
    const steps = m.steps.map((s) =>
      s.toolName === toolName && s.status === 'running'
        ? { ...s, result, status: 'done' as const }
        : s,
    )
    return { ...m, steps }
  })
}

function setError(msgs: Message[], id: string, message: string): Message[] {
  return msgs.map((m) => (m.id === id ? { ...m, content: message } : m))
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  async function send(text: string) {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: text, steps: [] },
    ])
    setLoading(true)

    const assistantId = crypto.randomUUID()
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', steps: [] },
    ])

    try {
      await subscribeToChat(text, (event) => {
        if (event.__typename === 'TextChunk') {
          setMessages((prev) => appendContent(prev, assistantId, event.content))
        } else if (event.__typename === 'ToolCallStarted') {
          const step: ToolStep = {
            id: crypto.randomUUID(),
            toolName: event.toolName,
            arguments: event.arguments,
            status: 'running',
          }
          setMessages((prev) => addStep(prev, assistantId, step))
        } else if (event.__typename === 'ToolCallCompleted') {
          setMessages((prev) => completeStep(prev, assistantId, event.toolName, event.result))
        }
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err)
      setMessages((prev) => setError(prev, assistantId, `Error: ${message}`))
    } finally {
      setLoading(false)
    }
  }

  return { messages, loading, send }
}
