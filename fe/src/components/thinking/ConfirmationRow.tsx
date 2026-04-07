import React, { useState } from 'react'
import type { ToolStep } from '../../types/chat'
import { toolLabel } from './toolMeta'

interface Props {
  step: ToolStep
  onConfirm: (runId: string, requirementId: string, confirmed: boolean) => Promise<void>
}

export function ConfirmationRow({ step, onConfirm }: Readonly<Props>) {
  const [pending, setPending] = useState(false)

  async function handle(confirmed: boolean) {
    if (!step.runId || !step.requirementId) return
    setPending(true)
    await onConfirm(step.runId, step.requirementId, confirmed)
    setPending(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>⏸</span>
        <span style={styles.label}>
          Allow <strong>{toolLabel(step.toolName)}</strong> to run?
        </span>
      </div>
      <div style={styles.actions}>
        <button
          style={{ ...styles.btn, ...styles.approveBtn }}
          disabled={pending}
          onClick={() => handle(true)}
        >
          {pending ? '…' : 'Approve'}
        </button>
        <button
          style={{ ...styles.btn, ...styles.rejectBtn }}
          disabled={pending}
          onClick={() => handle(false)}
        >
          Reject
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    margin: '4px 12px',
    padding: '10px 14px',
    borderRadius: '8px',
    background: '#fdf0f2',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
    fontSize: '13px',
    color: '#1a1a1a',
  },
  icon: {
    fontSize: '14px',
    color: '#cf6679',
  },
  label: {
    lineHeight: 1.4,
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  btn: {
    padding: '5px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
  },
  approveBtn: {
    background: '#cf6679',
    color: '#fff',
  },
  rejectBtn: {
    background: '#f0ede6',
    color: '#6b6b6b',
  },
}
