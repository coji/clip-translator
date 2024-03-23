import { invoke } from '@tauri-apps/api/tauri'

export const greet = async (name: string): Promise<string> => {
  return await invoke('greet', { name })
}
