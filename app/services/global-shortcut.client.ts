import { webviewWindow } from '@tauri-apps/api'
import * as clipboard from '@tauri-apps/plugin-clipboard-manager'
import {
  isRegistered,
  register,
  unregister,
  type ShortcutEvent,
} from '@tauri-apps/plugin-global-shortcut'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { $path } from 'remix-routes'
import { sendNotify } from './notification.client'

const HOTKEY = 'CommandOrControl+Shift+C'

const registerShortcut = async (
  shortcut: string,
  callback: (keys: ShortcutEvent) => void,
) => {
  if (!(await isRegistered(shortcut))) {
    await register(shortcut, async (keys) => {
      await sendNotify({
        title: 'Clip Translator',
        body: `${HOTKEY} is pressed`,
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
    registerShortcut(HOTKEY, async () => {
      const clipboardText = await clipboard.readText()
      if (clipboardText) {
        await webviewWindow.getCurrentWebviewWindow().setFocus()
        navigate($path('/', { source: clipboardText }))
      }
    })

    return () => {
      unregister(HOTKEY)
    }
  }, [])
}
