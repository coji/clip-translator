import { GoogleGenerativeAI, type UsageMetadata } from '@google/generative-ai'
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

const inputModelCostMap: Record<GeminiModels, number> = {
  'gemini-1.5-flash-latest': 0.35, // $0.35
  'models/gemini-1.5-pro-latest': 3.5, // $3.50
}

const outputModelCostMap: Record<GeminiModels, number> = {
  'gemini-1.5-flash-latest': 0.53, // $0.50
  'models/gemini-1.5-pro-latest': 21, // $21.00
}

export const calcTokenCostUSD = (model: GeminiModels, usage: UsageMetadata) => {
  const inputCost =
    (usage.promptTokenCount / 1000000) * inputModelCostMap[model]
  const outputCost =
    (usage.candidatesTokenCount / 1000000) * outputModelCostMap[model]
  console.log({
    usage,
    inputModelCost: inputModelCostMap[model],
    outputModelCost: outputModelCostMap[model],
    inputCost,
    outputCost,
  })
  return inputCost + outputCost
}
