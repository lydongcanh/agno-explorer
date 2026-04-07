import React, { useState, useEffect, useRef } from 'react'

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

export function AnimatedSpinner() {
  const [frame, setFrame] = useState(0)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    ref.current = setInterval(() => setFrame((f) => (f + 1) % SPINNER_FRAMES.length), 80)
    return () => {
      if (ref.current) clearInterval(ref.current)
    }
  }, [])

  return <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>{SPINNER_FRAMES[frame]}</span>
}
