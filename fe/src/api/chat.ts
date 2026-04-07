import { createClient } from 'graphql-ws'

function resolveErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (Array.isArray(err)) return err.map((e) => (e as Error)?.message ?? String(e)).join(', ')
  return String(err)
}

const CHAT_SUBSCRIPTION = `
  subscription Chat($message: String!) {
    chat(message: $message) {
      ... on TextChunk {
        __typename
        content
      }
      ... on ToolCallStarted {
        __typename
        toolName
        arguments
      }
      ... on ToolCallCompleted {
        __typename
        toolName
        result
      }
      ... on ConfirmationRequired {
        __typename
        runId
        requirementId
        toolName
        arguments
      }
    }
  }
`

const CONTINUE_CHAT_SUBSCRIPTION = `
  subscription ContinueChat($runId: String!, $requirementId: String!, $confirmed: Boolean!) {
    continueChat(runId: $runId, requirementId: $requirementId, confirmed: $confirmed) {
      ... on TextChunk {
        __typename
        content
      }
      ... on ToolCallStarted {
        __typename
        toolName
        arguments
      }
      ... on ToolCallCompleted {
        __typename
        toolName
        result
      }
    }
  }
`

export type ChatEventData =
  | { __typename: 'TextChunk'; content: string }
  | { __typename: 'ToolCallStarted'; toolName: string; arguments: string }
  | { __typename: 'ToolCallCompleted'; toolName: string; result: string }
  | { __typename: 'ConfirmationRequired'; runId: string; requirementId: string; toolName: string; arguments: string }

function makeClient() {
  const wsProtocol = globalThis.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return createClient({ url: `${wsProtocol}//${globalThis.location.host}/graphql` })
}

function runSubscription(
  client: ReturnType<typeof createClient>,
  query: string,
  variables: Record<string, unknown>,
  onEvent: (event: ChatEventData) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    client.subscribe(
      { query, variables },
      {
        next: (data) => {
          const event = (data.data as Record<string, ChatEventData>)[Object.keys(data.data as object)[0]]
          if (event) onEvent(event)
        },
        error: (err) => {
          client.dispose()
          reject(new Error(resolveErrorMessage(err)))
        },
        complete: () => {
          client.dispose()
          resolve()
        },
      },
    )
  })
}

export function subscribeToChat(
  message: string,
  onEvent: (event: ChatEventData) => void,
): Promise<void> {
  return runSubscription(makeClient(), CHAT_SUBSCRIPTION, { message }, onEvent)
}

export function subscribeToContinueChat(
  runId: string,
  requirementId: string,
  confirmed: boolean,
  onEvent: (event: ChatEventData) => void,
): Promise<void> {
  return runSubscription(makeClient(), CONTINUE_CHAT_SUBSCRIPTION, { runId, requirementId, confirmed }, onEvent)
}

