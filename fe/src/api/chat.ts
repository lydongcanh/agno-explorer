import { createClient } from 'graphql-ws'

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
    }
  }
`

export type ChatEventData =
  | { __typename: 'TextChunk'; content: string }
  | { __typename: 'ToolCallStarted'; toolName: string; arguments: string }
  | { __typename: 'ToolCallCompleted'; toolName: string; result: string }

export function subscribeToChat(
  message: string,
  onEvent: (event: ChatEventData) => void,
): Promise<void> {
  const wsProtocol = globalThis.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const client = createClient({ url: `${wsProtocol}//${globalThis.location.host}/graphql` })

  return new Promise((resolve, reject) => {
    client.subscribe(
      { query: CHAT_SUBSCRIPTION, variables: { message } },
      {
        next: (data) => {
          const event = (data.data as { chat: ChatEventData }).chat
          if (event) onEvent(event)
        },
        error: (err) => {
          client.dispose()
          const message = resolveErrorMessage(err)
          reject(new Error(message))
        },
        complete: () => {
          client.dispose()
          resolve()
        },
      },
    )
  })
}
