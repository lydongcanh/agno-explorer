import React from 'react'
import { useChat } from './hooks/useChat'
import { MessageList } from './components/MessageList'
import { ChatInput } from './components/ChatInput'

function App() {
  const { messages, loading, send } = useChat()

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <span>Agno Explorer</span>
      </header>
      <MessageList messages={messages} loading={loading} />
      <ChatInput onSend={send} disabled={loading} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#0f0f0f',
    color: '#e5e5e5',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid #2a2a2a',
    fontWeight: 600,
    fontSize: '16px',
    background: '#161616',
  },
}

export default App
