import { invoke } from '@tauri-apps/api/tauri'

interface AppConfig {
  anthropic_api_key: string
  system_prompt: string
}

export const loadAppConfig = async (): Promise<AppConfig | null> => {
  return await invoke('load_app_config')
}

export const saveAppConfig = async (appConfig: AppConfig): Promise<void> => {
  return await invoke('save_app_config', { config: appConfig })
}
