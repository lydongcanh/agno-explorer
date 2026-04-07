import { useState } from 'react'
import type { Message, ToolStep } from '../types/chat'
import { subscribeToChat, subscribeToContinueChat } from '../api/chat'

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

function addConfirmationStep(msgs: Message[], id: string, step: ToolStep): Message[] {
  return msgs.map((m) => (m.id === id ? { ...m, steps: [...m.steps, step] } : m))
}

function resolveConfirmationStep(msgs: Message[], requirementId: string): Message[] {
  return msgs.map((m) => ({
    ...m,
    steps: m.steps.map((s) =>
      s.requirementId === requirementId ? { ...s, status: 'done' as const } : s,
    ),
  }))
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
        } else if (event.__typename === 'ConfirmationRequired') {
          const step: ToolStep = {
            id: crypto.randomUUID(),
            toolName: event.toolName,
            arguments: event.arguments,
            status: 'awaiting_confirmation',
            runId: event.runId,
            requirementId: event.requirementId,
          }
          setMessages((prev) => addConfirmationStep(prev, assistantId, step))
        }
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err)
      setMessages((prev) => setError(prev, assistantId, `Error: ${message}`))
    } finally {
      setLoading(false)
    }
  }

  async function confirm(runId: string, requirementId: string, confirmed: boolean) {
    // Find the assistant message this confirmation belongs to
    const targetMsg = messages.find((m) => m.steps.some((s) => s.requirementId === requirementId))
    if (!targetMsg) return

    // Mark the confirmation step as done immediately
    setMessages((prev) => resolveConfirmationStep(prev, requirementId))

    // Subscribe to the continuation — events stream into the same message
    try {
      await subscribeToContinueChat(runId, requirementId, confirmed, (event) => {
        if (event.__typename === 'TextChunk') {
          setMessages((prev) => appendContent(prev, targetMsg.id, event.content))
        } else if (event.__typename === 'ToolCallStarted') {
          const step: ToolStep = {
            id: crypto.randomUUID(),
            toolName: event.toolName,
            arguments: event.arguments,
            status: 'running',
          }
          setMessages((prev) => addStep(prev, targetMsg.id, step))
        } else if (event.__typename === 'ToolCallCompleted') {
          setMessages((prev) => completeStep(prev, targetMsg.id, event.toolName, event.result))
        }
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setMessages((prev) => appendContent(prev, targetMsg.id, `\nError: ${msg}`))
    }
  }

  return { messages, loading, send, confirm }
}
