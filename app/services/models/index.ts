import { z } from 'zod'
import {
  ModelIdSchema as Claude3ModelIdSchema,
  ModelSchema as Claude3ModelSchema,
} from '~/services/models/claude3'
import {
  ModelIdSchema as GeminiModelIdSchema,
  ModelSchema as GeminiModelSchema,
} from '~/services/models/gemini'

export const ModelIdSchema = z.union([
  Claude3ModelIdSchema,
  GeminiModelIdSchema,
])
export const ModelSchema = z.union([Claude3ModelSchema, GeminiModelSchema])
export const Models: Record<
  z.infer<typeof ModelIdSchema>,
  | {
      provider: 'claude3'
      id: z.infer<typeof Claude3ModelSchema>
    }
  | {
      provider: 'gemini'
      id: z.infer<typeof GeminiModelSchema>
    }
> = {
  'Claude3 Opus': {
    provider: 'claude3',
    id: 'claude-3-opus-20240229',
  },
  'Claude3 Sonnet': {
    provider: 'claude3',
    id: 'claude-3-sonnet-20240229',
  },
  'Claude3 Haiku': {
    provider: 'claude3',
    id: 'claude-3-haiku-20240307',
  },
  'Gemini 1.5 Flash': {
    provider: 'gemini',
    id: 'gemini-1.5-flash-latest',
  },
  'Gemini 1.5 Pro': {
    provider: 'gemini',
    id: 'models/gemini-1.5-pro-latest',
  },
} as const
