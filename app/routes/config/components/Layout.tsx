import { twc } from 'react-twc'

export const ConfigPageLayout = twc.div`relative flex flex-col h-screen overflow-auto p-4`
export const ConfigHeader = twc.div`flex items-center gap-4 pb-8`
export const ConfigTitle = twc.h1`text-2xl font-bold`
export const ConfigContent = twc.div`flex flex-col gap-2 flex-1`
export const ConfigField = twc.div`flex flex-col gap-1`
export const ConfigFooter = twc.div`flex gap-4 mt-4`
export const BlockerAlert = twc.div`flex gap-4 fixed bottom-0 left-0 right-0 items-center bg-primary px-4 py-2 text-primary-foreground`
