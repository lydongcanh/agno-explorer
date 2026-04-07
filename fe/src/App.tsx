import React from 'react'
import { useChat } from './hooks/useChat'
import { MessageList } from './components/MessageList'
import { ChatInput } from './components/ChatInput'

function App() {
  const { messages, loading, send, confirm } = useChat()

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <span>Agno Explorer</span>
      </header>
      <MessageList messages={messages} loading={loading} onConfirm={confirm} />
      <ChatInput onSend={send} disabled={loading} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#f5f4ef',
    color: '#1a1a1a',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid #e5e3dc',
    fontWeight: 600,
    fontSize: '16px',
    background: '#f5f4ef',
  },
}

export default App
