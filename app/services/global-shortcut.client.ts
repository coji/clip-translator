import {
  isRegistered,
  register,
  unregister,
} from '@tauri-apps/api/globalShortcut'
import { useEffect } from 'react'
import { sendNotify } from './notification.client'

const registerShortcut = async (
  shortcut: string,
  callback: (keys: string) => void,
) => {
  if (!(await isRegistered(shortcut))) {
    await register(shortcut, async (keys) => {
      await sendNotify({ title: 'Hotkey', body: 'CmdOrCtrl+T is pressed' })
      callback(keys)
    })
  }
}

export const useGlobalShortcut = async (callback: (keys: string) => void) => {
  useEffect(() => {
    registerShortcut('CmdOrCtrl+T', callback)

    return () => {
      unregister('CmdOrCtrl+T')
    }
  }, [callback])
}
