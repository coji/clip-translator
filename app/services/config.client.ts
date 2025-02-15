import { redirect } from 'react-router';
import { fs, path } from '@tauri-apps/api'
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

const getConfigPath = async () => {
  const appConfigDir = await path.appConfigDir()
  await fs.createDir(appConfigDir, { recursive: true })
  return await path.resolve(appConfigDir, 'config.json')
}

export const loadConfig = async (): Promise<Config> => {
  try {
    const configPath = await getConfigPath()
    const configStr = await fs.readTextFile(configPath)
    return ConfigSchema.parse(JSON.parse(configStr))
  } catch {
    return defaultConfig
  }
}

export const requireApiKey = async () => {
  const config = await loadConfig()
  if (config.gemini_api_key) {
    return config as Required<Config>
  }
  throw redirect('/config')
}

export const saveConfig = async (config: Config) => {
  const configPath = await getConfigPath()
  await fs.writeTextFile(configPath, JSON.stringify(config, null, 2))
}
