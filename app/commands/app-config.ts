import { invoke } from '@tauri-apps/api/tauri'

interface AppConfig {
  anthropic_api_key: string
  openai_api_key: string
  openai_organization: string
  system_prompt: string
}

export const loadAppConfig = async (): Promise<AppConfig | null> => {
  const config = (await invoke('load_app_config')) as AppConfig | null
  console.log({ config })
  if (config) {
    return {
      anthropic_api_key: config.anthropic_api_key ?? '',
      openai_api_key: config.openai_api_key ?? '',
      openai_organization: config.openai_organization ?? '',
      system_prompt: config.system_prompt ?? '',
    }
  }
  return config
}

export const saveAppConfig = async (appConfig: AppConfig): Promise<void> => {
  return await invoke('save_app_config', { config: appConfig })
}
