import React, { useState } from 'react'

interface Props {
  onSend: (message: string) => void
  disabled: boolean
}

export function ChatInput({ onSend, disabled }: Readonly<Props>) {
  const [input, setInput] = useState('')

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const text = input.trim()
    if (!text || disabled) return
    setInput('')
    onSend(text)
  }

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <input
        style={styles.input}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
        autoFocus
      />
      <button style={styles.button} type="submit" disabled={disabled || !input.trim()}>
        Send
      </button>
    </form>
  )
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: 'flex',
    gap: '8px',
    padding: '16px 24px',
    borderTop: '1px solid #2a2a2a',
    background: '#161616',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #2a2a2a',
    background: '#1e1e1e',
    color: '#e5e5e5',
    fontSize: '15px',
    outline: 'none',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#7c3aed',
    color: '#fff',
    fontSize: '15px',
    cursor: 'pointer',
    fontWeight: 500,
  },
}
