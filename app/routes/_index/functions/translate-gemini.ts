import { calcTokenCostUSD, callGemini } from '~/services/models/gemini'

interface TranslateSuccess {
  type: 'success'
  sourceLanguage: string
  destinationLanguage: string
  destinationText: string
  inputTokens?: number
  outputTokens?: number
  cost: number
}

interface TranslateError {
  type: 'error'
  error: string
}

type GeminiModel = Parameters<typeof callGemini>[0]['model']

interface TranslateProps {
  apiKey: string
  systemPrompt: string
  model: GeminiModel
  source: string
}
export const translateByGemini = async ({
  apiKey,
  systemPrompt,
  model,
  source,
}: TranslateProps): Promise<TranslateSuccess | TranslateError> => {
  try {
    const response = await callGemini({
      apiKey,
      system: systemPrompt,
      model,
      maxTokens: 100000,
      message: source,
    })

    return {
      type: 'success',
      sourceLanguage: 'ja',
      destinationLanguage: 'en',
      destinationText: response.content,
      inputTokens: response.usage?.promptTokenCount,
      outputTokens: response.usage?.candidatesTokenCount,
      cost: response.usage ? calcTokenCostUSD(model, response.usage) : 0,
    }
  } catch (e) {
    let errorMessage = ''
    if (e instanceof Error) {
      errorMessage = `${e.name}: ${e.message}, ${e.stack}`
    } else {
      errorMessage = String(e)
    }
    return { type: 'error', error: errorMessage }
  }
}
