import * as fs from '@tauri-apps/plugin-fs'
import { redirect } from 'react-router'
import { z } from 'zod'

export const defaultConfig = {
  anthropic_api_key: '',
  system_prompt: `あなたは言語翻訳AIアシスタントです。入力されたテキストを、フォーマットはそのままに日本語に翻訳してください。
markdown などのマークダウンはそのまま残してください。`,
  model: 'Gemini 1.5 Flash',
} as const

const ConfigSchema = z.object({
  gemini_api_key: z.string().optional(),
  system_prompt: z.string().optional().default(defaultConfig.system_prompt),
  model: z.string().optional().default(defaultConfig.model),
})
export type Config = z.infer<typeof ConfigSchema>

export const loadConfig = async (): Promise<Config> => {
  try {
    const configStr = await fs.readTextFile('config.json', {
      baseDir: fs.BaseDirectory.AppConfig,
    })
    return ConfigSchema.parse(JSON.parse(configStr))
  } catch {
    return defaultConfig
  }
}

export const saveConfig = async (config: Config) => {
  await fs.writeTextFile('config.json', JSON.stringify(config, null, 2), {
    baseDir: fs.BaseDirectory.AppConfig,
  })
}

export const requireApiKey = async () => {
  const config = await loadConfig()
  if (config.gemini_api_key) {
    return config as Required<Config>
  }
  throw redirect('/config')
}
