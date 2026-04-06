import { createClient } from 'graphql-ws'

const CHAT_SUBSCRIPTION = `
  subscription Chat($message: String!) {
    chat(message: $message)
  }
`

export function subscribeToChat(
  message: string,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const wsProtocol = globalThis.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const client = createClient({ url: `${wsProtocol}//${globalThis.location.host}/graphql` })

  return new Promise((resolve, reject) => {
    client.subscribe(
      { query: CHAT_SUBSCRIPTION, variables: { message } },
      {
        next: (data) => {
          const chunk = (data.data as { chat: string }).chat
          if (chunk) onChunk(chunk)
        },
        error: (err) => {
          client.dispose()
          reject(err instanceof Error ? err : new Error(String(err)))
        },
        complete: () => {
          client.dispose()
          resolve()
        },
      },
    )
  })
}
