import { GoogleGenerativeAI, type UsageMetadata } from '@google/generative-ai'
import { match } from 'ts-pattern'
import { z } from 'zod'

export const ModelIdSchema = z.enum(['Gemini 1.5 Flash', 'Gemini 1.5 Pro'])
export const ModelSchema = z.enum([
  'gemini-1.5-flash-latest',
  'models/gemini-1.5-pro-latest',
])
export type GeminiModels = z.infer<typeof ModelSchema>
export const Models: Record<
  z.infer<typeof ModelIdSchema>,
  z.infer<typeof ModelSchema>
> = {
  'Gemini 1.5 Flash': 'gemini-1.5-flash-latest' as const,
  'Gemini 1.5 Pro': 'models/gemini-1.5-pro-latest' as const,
} as const
export type Claude3Models = z.infer<typeof ModelSchema>

export const callGemini = async ({
  apiKey,
  system,
  message,
  model,
  maxTokens,
  temperature,
}: {
  apiKey: string
  system: string
  message: string
  model: GeminiModels
  maxTokens: number
  temperature?: number
}) => {
  const genAI = new GoogleGenerativeAI(apiKey)
  const genModel = genAI.getGenerativeModel({ model })
  const result = await genModel.generateContent({
    generationConfig: {
      maxOutputTokens: maxTokens,
      candidateCount: 1,
      temperature,
    },
    systemInstruction: { text: system },
    contents: [{ role: 'user', parts: [{ text: message }] }],
  })

  return {
    content: result.response.candidates?.[0].content.parts[0].text ?? '',
    usage: result.response.usageMetadata,
  }
}

export const calcTokenCostUSD = (model: GeminiModels, usage: UsageMetadata) => {
  return match(model)
    .with('gemini-1.5-flash-latest', () => {
      if (usage.promptTokenCount < 128 * 1000) {
        const promptTokenCost = (usage.promptTokenCount / 1000000) * 0.35
        const candidatesTokenCost =
          (usage.candidatesTokenCount / 1000000) * 0.53
        return promptTokenCost + candidatesTokenCost
      }
      const promptTokenCost = (usage.promptTokenCount / 1000000) * 0.7
      const candidatesTokenCost = (usage.candidatesTokenCount / 1000000) * 1.05
      return promptTokenCost + candidatesTokenCost
    })
    .with('models/gemini-1.5-pro-latest', () => {
      if (usage.promptTokenCount < 128 * 1000) {
        const promptTokenCost = (usage.promptTokenCount / 1000000) * 3.5
        const candidatesTokenCost =
          (usage.candidatesTokenCount / 1000000) * 10.5
        return promptTokenCost + candidatesTokenCost
      }
      const promptTokenCost = (usage.promptTokenCount / 1000000) * 7
      const candidatesTokenCost = (usage.candidatesTokenCount / 1000000) * 21
      return promptTokenCost + candidatesTokenCost
    })
    .exhaustive()
}
