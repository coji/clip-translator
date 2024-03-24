import { redirect } from '@remix-run/react'
import { fs, path } from '@tauri-apps/api'

export interface Config {
  anthropic_api_key: string
  system_prompt: string
}

export const defaultConfig = {
  anthropic_api_key: '',
  system_prompt: `あなたは言語翻訳AIアシスタントです。以下の手順に従って、入力されたテキストを翻訳してください。

手順:

入力されたテキストの言語を判定してください。日本語の場合は手順2に、英語の場合は手順3に進んでください。
日本語から英語への翻訳を行ってください。翻訳結果を"英訳:"と表示した後に出力してください。
英語から日本語への翻訳を行ってください。翻訳結果を"和訳:"と表示した後に出力してください。
入力されたテキストが日本語でも英語でもない場合は、"入力された言語を判定できませんでした。日本語または英語で入力してください。"と出力してください。
翻訳を開始します。

出力例:
入力:
Hello, how are you doing today?

和訳:
こんにちは、今日はどうですか?

入力:
こんばんは。今日はとても暑いですね。

英訳:
Good evening. It's very hot today, isn't it?`,
} as const satisfies Config

const getConfigPath = async () => {
  const appConfigDir = await path.appConfigDir()
  await fs.createDir(appConfigDir, { recursive: true })
  return await path.resolve(appConfigDir, 'config.json')
}

export const loadConfig = async (): Promise<Config> => {
  const configPath = await getConfigPath()
  const configStr = await fs.readTextFile(configPath).catch(() => {
    return JSON.stringify(defaultConfig)
  })
  return JSON.parse(configStr)
}

export const requireApiKey = async () => {
  const config = await loadConfig()
  if (config.anthropic_api_key) {
    return config
  }
  throw redirect('/config')
}

export const saveConfig = async (config: Config) => {
  const configPath = await getConfigPath()
  await fs.writeTextFile(configPath, JSON.stringify(config))
}
