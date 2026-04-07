import React from 'react'
import type { ToolStep } from '../../types/chat'
import { toolLabel } from './toolMeta'
import { AnimatedSpinner } from './AnimatedSpinner'

export function StepRow({ step, index }: Readonly<{ step: ToolStep; index: number }>) {
  const isDone = step.status === 'done'
  const isRunning = step.status === 'running'

  let stepStyle = styles.step
  if (isRunning) stepStyle = { ...styles.step, ...styles.stepRunning }
  else if (isDone) stepStyle = { ...styles.step, ...styles.stepDone }

  return (
    <div style={stepStyle}>
      <div style={styles.stepHeader}>
        <span style={styles.stepIndex}>{index + 1}</span>
        {isRunning ? (
          <AnimatedSpinner />
        ) : (
          <span style={styles.checkIcon}>✓</span>
        )}
        <span style={{ ...styles.stepLabel, ...(isRunning ? styles.stepLabelRunning : {}) }}>
          {toolLabel(step.toolName)}
        </span>
      </div>

      {isRunning && (
        <div style={styles.progressBar}>
          <div style={styles.progressFill} />
        </div>
      )}

      {isDone && step.result && (
        <p style={styles.result}>{step.result}</p>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  step: {
    padding: '8px 12px',
    borderRadius: '6px',
  },
  stepRunning: {
    background: '#fdf0f2',
  },
  stepDone: {
    background: 'transparent',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stepIndex: {
    fontSize: '11px',
    color: '#c5c0b8',
    minWidth: '14px',
  },
  checkIcon: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#16a34a',
  },
  stepLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#6b6b6b',
  },
  stepLabelRunning: {
    color: '#cf6679',
  },
  result: {
    margin: '6px 0 0 22px',
    fontSize: '13px',
    lineHeight: 1.5,
    color: '#6b6b6b',
    whiteSpace: 'pre-wrap',
  },
  progressBar: {
    marginTop: '6px',
    height: '2px',
    background: '#f9d0d7',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '40%',
    background: '#cf6679',
    borderRadius: '2px',
    animation: 'slide 1.2s ease-in-out infinite',
  },
}
