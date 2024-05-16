import { calcTokenCostUSD, callClaude3 } from '~/services/models/claude3'

interface TranslateSuccess {
  type: 'success'
  sourceLanguage: string
  destinationLanguage: string
  destinationText: string
  cost: number
}

interface TranslateError {
  type: 'error'
  error: string
}

export type Claude3Model = Parameters<typeof callClaude3>[0]['model']

interface TranslateProps {
  apiKey: string
  systemPrompt: string
  model: Claude3Model
  source: string
}
export const translateByClaude3 = async ({
  apiKey,
  systemPrompt,
  model,
  source,
}: TranslateProps): Promise<TranslateSuccess | TranslateError> => {
  try {
    const response = await callClaude3({
      apiKey,
      system: systemPrompt,
      model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: source }],
    })

    return {
      type: 'success',
      sourceLanguage: 'ja',
      destinationLanguage: 'en',
      destinationText: response.content[0].text,
      cost: calcTokenCostUSD(model, response.usage),
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
