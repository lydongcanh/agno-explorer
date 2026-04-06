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
      <button
        style={disabled || !input.trim() ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
        type="submit"
        disabled={disabled || !input.trim()}
      >
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
    borderTop: '1px solid #e5e3dc',
    background: '#f5f4ef',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #d9d6ce',
    background: '#fff',
    color: '#1a1a1a',
    fontSize: '15px',
    outline: 'none',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#cf6679',
    color: '#fff',
    fontSize: '15px',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'opacity 0.15s, background 0.15s',
  },
  buttonDisabled: {
    background: '#d9d6ce',
    color: '#a8a29e',
    cursor: 'not-allowed',
  },
}
