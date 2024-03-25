import { Anthropic } from '@anthropic-ai/sdk'
import { Body, fetch } from '@tauri-apps/api/http'
import { useCallback, useState } from 'react'

export const useClaude3 = ({
  apiKey,
  systemPrompt,
}: {
  apiKey: string
  systemPrompt: string
}) => {
  const [result, setResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const anthropic = new Anthropic({ apiKey })

  const getAnswer = useCallback(
    async (question: string) => {
      setResult('')
      setIsLoading(true)
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [
          { role: 'user', content: systemPrompt },
          { role: 'user', content: question },
        ],
        stream: true,
      })

      for await (const message of response) {
        if (message.type === 'content_block_delta') {
          setResult((prev) => `${prev}${message.delta.text}`)
        }
      }
      setIsLoading(false)
    },
    [anthropic, systemPrompt],
  )

  return { getAnswer, result, isLoading }
}

export const callClaude3 = async ({
  apiKey,
  system,
  messages,
  model,
  max_tokens,
  temperature,
}: {
  apiKey: string
  system: string
  messages: { role: 'user'; content: string }[]
  model:
    | 'claude-3-opus-20240229'
    | 'claude-3-sonnet-20240229'
    | 'claude-3-haiku-20240307'
  max_tokens: number
  temperature?: number
}) => {
  // if (import.meta.env.DEV) {
  //   await new Promise((resolve) => setTimeout(resolve, 1000))
  //   return 'This is example translated result because of in development process.'
  // }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    body: Body.json({
      model,
      max_tokens,
      system,
      messages,
      temperature,
    }),
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Translation Error: ${JSON.stringify(response.data)}`)
  }
  return response.data as Anthropic.Messages.Message
}
