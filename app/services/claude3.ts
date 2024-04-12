import type { Anthropic } from '@anthropic-ai/sdk'
import { Body, fetch } from '@tauri-apps/api/http'

export const Models = {
  opus: 'claude-3-opus-20240229' as const,
  sonnet: 'claude-3-sonnet-20240229' as const,
  haiku: 'claude-3-haiku-20240307' as const,
}
export type Claude3Models = (typeof Models)[keyof typeof Models]

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
  model: Claude3Models
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
    throw new Error(`Error: ${JSON.stringify(response.data)}`)
  }
  return response.data as Anthropic.Messages.Message
}

const inputModelCostMap: Record<Claude3Models, number> = {
  'claude-3-opus-20240229': 15,
  'claude-3-sonnet-20240229': 3,
  'claude-3-haiku-20240307': 0.25,
}

const outputModelCostMap: Record<Claude3Models, number> = {
  'claude-3-opus-20240229': 75,
  'claude-3-sonnet-20240229': 15,
  'claude-3-haiku-20240307': 1.25,
}

export const calcTokenCostUSD = (
  model: Claude3Models,
  usage: Anthropic.Messages.Usage,
) => {
  const inputCost = (usage.input_tokens / 1000000) * inputModelCostMap[model]
  const outputCost = (usage.output_tokens / 1000000) * outputModelCostMap[model]
  return inputCost + outputCost
}
