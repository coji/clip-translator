import { OpenAI } from 'openai'
import { useCallback, useState } from 'react'

export const useOpenAI = ({
  apiKey,
  organization,
  systemPrompt,
}: {
  apiKey: string
  organization?: string
  systemPrompt: string
}) => {
  const [result, setResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const openai = new OpenAI({
    apiKey,
    organization,
    dangerouslyAllowBrowser: true,
  })

  const getAnswer = useCallback(
    async (question: string) => {
      setResult('')
      setIsLoading(true)
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        max_tokens: 1000,
        messages: [
          { role: 'user', content: systemPrompt },
          { role: 'user', content: question },
        ],
        stream: true,
      })

      for await (const message of response) {
        const delta = message.choices[0].delta.content
        if (delta) {
          setResult((prev) => `${prev}${delta}`)
        }
      }
      setIsLoading(false)
    },
    [openai, systemPrompt],
  )

  return { getAnswer, result, isLoading }
}
