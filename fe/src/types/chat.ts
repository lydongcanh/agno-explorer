export interface ToolStep {
  id: string
  toolName: string
  arguments: string
  result?: string
  status: 'running' | 'done' | 'awaiting_confirmation'
  // HITL fields — present when status === 'awaiting_confirmation'
  runId?: string
  requirementId?: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  steps: ToolStep[]
}
