export interface ToolStep {
  id: string
  toolName: string
  arguments: string
  result?: string
  status: 'running' | 'done'
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  steps: ToolStep[]
}
