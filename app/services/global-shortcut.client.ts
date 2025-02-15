import { useNavigate } from 'react-router';
import {  webviewWindow } from '@tauri-apps/api'
import {
  isRegistered,
  register,
  unregister,
} from '@tauri-apps/plugin-global-shortcut'
import { useEffect } from 'react'
import { $path } from 'remix-routes'
import { sendNotify } from './notification.client'
import * as clipboard from "@tauri-apps/plugin-clipboard-manager"

const registerShortcut = async (
  shortcut: string,
  callback: (keys: string) => void,
) => {
  if (!(await isRegistered(shortcut))) {
    await register(shortcut, async (keys) => {
      await sendNotify({
        title: 'Clip Translator',
        body: 'CmdOrCtrl+L is pressed',
        icon: 'd',
      })
      callback(keys)
    })
  }
}

export const useGlobalShortcut = async () => {
  const navigate = useNavigate()

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    registerShortcut('CmdOrCtrl+L', async () => {
      const clipboardText = await clipboard.readText()
      if (clipboardText) {
        await tauri_window.getCurrent().setFocus()
        navigate($path('/', { source: clipboardText }))
      }
    })

    return () => {
      unregister('CmdOrCtrl+L')
    }
  }, [])
}
