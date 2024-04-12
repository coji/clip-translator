import { StructuredOutputParser } from 'langchain/output_parsers'
import { z } from 'zod'
import { calcTokenCostUSD, callClaude3 } from '~/services/claude3'

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
export const translate = async ({
  apiKey,
  systemPrompt,
  model,
  source,
}: TranslateProps): Promise<TranslateSuccess | TranslateError> => {
  const outputParser = StructuredOutputParser.fromZodSchema(
    z.object({
      sourceLanguage: z.string(),
      destinationLanguage: z.string(),
      destinationText: z.string().max(4000),
    }),
  )

  const system = `${systemPrompt}
${outputParser.getFormatInstructions()}
`

  try {
    const response = await callClaude3({
      apiKey,
      system,
      model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: source }],
    })

    const result = await outputParser.parse(response.content[0].text)

    return {
      type: 'success',
      ...result,
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
