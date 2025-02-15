import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
  type Options,
} from '@tauri-apps/plugin-notification'

export const initNotification = async () => {
  if (!(await isPermissionGranted())) {
    console.log('Permission not granted')
    await requestPermission()
  }
}

export const sendNotify = async (options: Options) => {
  await sendNotification(options)
}
