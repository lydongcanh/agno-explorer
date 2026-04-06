import React, { useState } from 'react'
import type { ToolStep } from '../types/chat'

interface Props {
  steps: ToolStep[]
}

export function ThinkingSteps({ steps = [] }: Readonly<Props>) {
  const [expanded, setExpanded] = useState(false)

  if (steps.length === 0) return null

  const allDone = steps.every((s) => s.status === 'done')

  return (
    <div style={styles.container}>
      <button style={styles.toggle} onClick={() => setExpanded(!expanded)}>
        <span style={allDone ? styles.iconDone : styles.iconRunning}>
          {allDone ? '✓' : '●'}
        </span>
        {steps.length === 1 ? '1 tool call' : `${steps.length} tool calls`}
        <span style={styles.chevron}>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div style={styles.steps}>
          {steps.map((step) => (
            <div key={step.id} style={styles.step}>
              <div style={styles.stepHeader}>
                <code style={styles.toolName}>{step.toolName}</code>
                <span style={step.status === 'running' ? styles.iconRunning : styles.iconDone}>
                  {step.status === 'running' ? '●' : '✓'}
                </span>
              </div>
              <pre style={styles.pre}>{formatJson(step.arguments)}</pre>
              {step.result !== undefined && (
                <pre style={{ ...styles.pre, ...styles.result }}>{formatJson(step.result)}</pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatJson(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: '8px',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: '1px solid #e5e3dc',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '13px',
    color: '#6b6b6b',
    cursor: 'pointer',
  },
  chevron: {
    fontSize: '10px',
    marginLeft: '2px',
  },
  iconDone: {
    color: '#16a34a',
    fontSize: '11px',
  },
  iconRunning: {
    color: '#ca8a04',
    fontSize: '11px',
    animation: 'pulse 1s infinite',
  },
  steps: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  step: {
    background: '#fff',
    border: '1px solid #e5e3dc',
    borderRadius: '6px',
    padding: '10px 12px',
  },
  stepHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  toolName: {
    fontSize: '13px',
    fontFamily: 'ui-monospace, Consolas, monospace',
    color: '#1a1a1a',
  },
  pre: {
    margin: 0,
    fontSize: '12px',
    fontFamily: 'ui-monospace, Consolas, monospace',
    color: '#4b5563',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    background: '#f5f4ef',
    borderRadius: '4px',
    padding: '6px 8px',
  },
  result: {
    marginTop: '6px',
    color: '#16a34a',
  },
}
