import React, { useState } from 'react'
import type { ToolStep } from '../../types/chat'
import { toolLabel } from './toolMeta'
import { AnimatedSpinner } from './AnimatedSpinner'
import { StepRow } from './StepRow'

interface Props {
  steps: ToolStep[]
}

function getToggleLabel(allDone: boolean, count: number, runningStep?: ToolStep): string {
  if (allDone) {
    const toolWord = count === 1 ? '1 tool' : count.toString() + ' tools'
    return 'Used ' + toolWord
  }
  if (runningStep) return `Running ${toolLabel(runningStep.toolName)}...`
  return 'Thinking...'
}

export function ThinkingSteps({ steps = [] }: Readonly<Props>) {
  const [expanded, setExpanded] = useState(true)

  if (steps.length === 0) return null

  const allDone = steps.every((s) => s.status === 'done')
  const runningStep = steps.find((s) => s.status === 'running')

  return (
    <div style={styles.container}>
      <button
        style={{ ...styles.toggle, ...(allDone ? styles.toggleDone : styles.toggleRunning) }}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={styles.toggleLeft}>
          {allDone ? null : <AnimatedSpinner />}
          <span style={styles.toggleLabel}>
            {getToggleLabel(allDone, steps.length, runningStep)}
          </span>
        </span>
        <span style={styles.chevron}>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div style={styles.steps}>
          {steps.map((step, index) => (
            <StepRow key={step.id} step={step} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    cursor: 'pointer',
    border: 'none',
    textAlign: 'left',
  },
  toggleRunning: {
    background: '#fdf0f2',
    color: '#cf6679',
  },
  toggleDone: {
    background: '#f0ede6',
    color: '#8a7060',
  },
  toggleLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  toggleLabel: {
    fontWeight: 500,
  },
  chevron: {
    fontSize: '10px',
    opacity: 0.4,
  },
  steps: {
    marginTop: '4px',
    display: 'flex',
    flexDirection: 'column',
  },
}
