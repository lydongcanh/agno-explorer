import React, { useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Message } from '../types/chat'
import { ThinkingSteps } from './ThinkingSteps'

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
        <div key={msg.id} style={styles.messageGroup}>
          {msg.role === 'assistant' && <ThinkingSteps steps={msg.steps} />}
          {msg.content && (
            <div
              className={msg.role === 'assistant' ? 'assistant-bubble' : undefined}
              style={{
                ...styles.bubble,
                ...(msg.role === 'user' ? styles.userBubble : styles.assistantBubble),
              }}
            >
              {msg.role === 'assistant' ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          )}
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
  messageGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },
  bubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '12px',
    lineHeight: 1.5,
    fontSize: '15px',
    wordBreak: 'break-word',
    textAlign: 'left',
  },
  userBubble: {
    alignSelf: 'flex-end',
    background: '#f0ede6',
    color: '#1a1a1a',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    width: '100%',
    maxWidth: '100%',
    background: 'transparent',
    color: '#1a1a1a',
  },
}
