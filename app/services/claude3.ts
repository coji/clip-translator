import { Anthropic } from '@anthropic-ai/sdk'
import { useCallback, useState } from 'react'

export const useClaude3 = ({
  apiKey,
  systemPrompt,
}: {
  apiKey: string
  systemPrompt: string
}) => {
  const [result, setResult] = useState<string | null>(null)
  const anthropic = new Anthropic({ apiKey })

  const getAnswer = useCallback(
    async (question: string) => {
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
    },
    [anthropic, systemPrompt],
  )

  return { getAnswer, result }
}
