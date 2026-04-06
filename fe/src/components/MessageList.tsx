import React, { useRef, useEffect } from 'react'
import type { Message } from '../types/chat'

interface Props {
  messages: Message[]
  loading: boolean
}

export function MessageList({ messages, loading }: Readonly<Props>) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div style={styles.container}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
            ...styles.bubble,
            ...(msg.role === 'user' ? styles.userBubble : styles.assistantBubble),
          }}
        >
          {msg.content}
        </div>
      ))}
      {loading && (
        <div style={{ ...styles.bubble, ...styles.assistantBubble, opacity: 0.5 }}>
          Thinking...
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  bubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '12px',
    lineHeight: 1.5,
    fontSize: '15px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  userBubble: {
    alignSelf: 'flex-end',
    background: '#7c3aed',
    color: '#fff',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    background: '#1e1e1e',
    border: '1px solid #2a2a2a',
  },
}
