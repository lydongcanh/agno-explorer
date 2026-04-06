import React, { useState, useEffect, useRef } from 'react'
import type { ToolStep } from '../types/chat'

interface Props {
  steps: ToolStep[]
}

const TOOL_LABELS: Record<string, string> = {
  detect_language: 'Detecting language',
  analyze_style: 'Analyzing style',
  analyze_complexity: 'Analyzing complexity',
  check_naming: 'Checking naming',
  check_security: 'Scanning security',
}

function toolLabel(name: string): string {
  return TOOL_LABELS[name] ?? name.replaceAll('_', ' ')
}

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

function AnimatedSpinner() {
  const [frame, setFrame] = useState(0)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    ref.current = setInterval(() => setFrame((f) => (f + 1) % SPINNER_FRAMES.length), 80)
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [])

  return <span style={styles.spinner}>{SPINNER_FRAMES[frame]}</span>
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
          {allDone ? (
            <span style={styles.checkIcon}>✓</span>
          ) : (
            <AnimatedSpinner />
          )}
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

function StepRow({ step, index }: Readonly<{ step: ToolStep; index: number }>) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const isDone = step.status === 'done'
  const isRunning = step.status === 'running'

  let stepStyle = styles.step
  if (isRunning) stepStyle = { ...styles.step, ...styles.stepRunning }
  else if (isDone) stepStyle = { ...styles.step, ...styles.stepDone }

  return (
    <div style={stepStyle}>
      <div style={styles.stepHeader}>
        <div style={styles.stepLeft}>
          <span style={styles.stepIndex}>{index + 1}</span>
          {isRunning ? (
            <AnimatedSpinner />
          ) : (
            <span style={styles.checkIcon}>✓</span>
          )}
          <span style={{ ...styles.stepLabel, ...(isRunning ? styles.stepLabelRunning : {}) }}>
            {toolLabel(step.toolName)}
          </span>
          <code style={styles.toolCode}>{step.toolName}</code>
        </div>
        {isDone && (
          <button style={styles.detailsToggle} onClick={() => setDetailsOpen(!detailsOpen)}>
            {detailsOpen ? 'hide' : 'details'}
          </button>
        )}
      </div>

      {isRunning && (
        <div style={styles.progressBar}>
          <div style={styles.progressFill} />
        </div>
      )}

      {detailsOpen && isDone && (
        <div style={styles.details}>
          <div style={styles.detailSection}>
            <span style={styles.detailLabel}>Input</span>
            <pre style={styles.pre}>{formatJson(step.arguments)}</pre>
          </div>
          {step.result !== undefined && (
            <div style={styles.detailSection}>
              <span style={styles.detailLabel}>Output</span>
              <pre style={{ ...styles.pre, ...styles.resultPre }}>{formatJson(step.result)}</pre>
            </div>
          )}
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
    background: '#f5f0e0',
    color: '#92400e',
  },
  toggleDone: {
    background: '#f0ede6',
    color: '#6b6b6b',
  },
  toggleLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  toggleLabel: {
    fontWeight: 500,
  },
  checkIcon: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#16a34a',
  },
  spinner: {
    fontFamily: 'monospace',
    fontSize: '14px',
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
  step: {
    padding: '8px 12px',
    borderRadius: '6px',
  },
  stepRunning: {
    background: '#f5f0e0',
  },
  stepDone: {
    background: 'transparent',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stepIndex: {
    fontSize: '11px',
    color: '#c5c0b8',
    minWidth: '14px',
  },
  stepLabel: {
    fontSize: '13px',
    color: '#6b6b6b',
  },
  stepLabelRunning: {
    color: '#92400e',
    fontWeight: 500,
  },
  toolCode: {
    fontSize: '11px',
    fontFamily: 'ui-monospace, Consolas, monospace',
    color: '#c5c0b8',
  },
  detailsToggle: {
    fontSize: '11px',
    color: '#c5c0b8',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    textDecoration: 'underline',
  },
  progressBar: {
    marginTop: '6px',
    height: '2px',
    background: '#e8e0cc',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '40%',
    background: '#d4a853',
    borderRadius: '2px',
    animation: 'slide 1.2s ease-in-out infinite',
  },
  details: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  detailSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  detailLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#c5c0b8',
    fontWeight: 600,
  },
  pre: {
    margin: 0,
    fontSize: '12px',
    fontFamily: 'ui-monospace, Consolas, monospace',
    color: '#6b6b6b',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    background: '#eceae3',
    borderRadius: '4px',
    padding: '6px 8px',
  },
  resultPre: {
    color: '#3d6b50',
    background: '#e8f0eb',
  },
}
