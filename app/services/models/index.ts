import type { z } from 'zod'
import {
  ModelIdSchema as GeminiModelIdSchema,
  ModelSchema as GeminiModelSchema,
} from '~/services/models/gemini'

export const ModelIdSchema = GeminiModelIdSchema
export const ModelSchema = GeminiModelSchema
export const Models: Record<
  z.infer<typeof ModelIdSchema>,
  {
    provider: 'gemini'
    id: z.infer<typeof GeminiModelSchema>
  }
> = {
  'Gemini 1.5 Flash': {
    provider: 'gemini',
    id: 'gemini-1.5-flash-latest',
  },
  'Gemini 1.5 Pro': {
    provider: 'gemini',
    id: 'models/gemini-1.5-pro-latest',
  },
} as const
