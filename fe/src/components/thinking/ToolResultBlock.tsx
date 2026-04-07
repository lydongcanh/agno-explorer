import React from 'react'
import type { ToolStep } from '../../types/chat'
import { toolLabel, toolIcon } from './toolMeta'

export function ToolResultBlock({ step }: Readonly<{ step: ToolStep }>) {
  if (!step.result) return null

  return (
    <div style={styles.container}>
      <h4 style={styles.heading}>
        <span style={styles.iconBadge}>{toolIcon(step.toolName)}</span>
        {toolLabel(step.toolName)}
        <code style={styles.toolCode}>{step.toolName}</code>
      </h4>
      <p style={styles.result}>{step.result}</p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: '16px',
  },
  heading: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '0 0 6px',
    fontSize: '15px',
    fontWeight: 600,
    color: '#1a1a1a',
  },
  iconBadge: {
    fontSize: '15px',
    color: '#a8a29e',
    fontFamily: 'ui-monospace, Consolas, monospace',
  },
  toolCode: {
    fontSize: '12px',
    fontFamily: 'ui-monospace, Consolas, monospace',
    color: '#c5c0b8',
    fontWeight: 400,
  },
  result: {
    margin: 0,
    fontSize: '15px',
    lineHeight: 1.6,
    color: '#1a1a1a',
    whiteSpace: 'pre-wrap',
  },
}
