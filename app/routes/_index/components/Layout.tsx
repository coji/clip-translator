import { twc } from 'react-twc'

export const IndexLayout = twc.div`grid h-screen grid-cols-1 grid-rows-[1fr_auto] gap-2 bg-slate-200 p-2`
export const TranslationPane = twc.div`grid flex-1 grid-cols-1 grid-rows-2 gap-2 sm:grid-cols-2 sm:grid-rows-1`
export const SourcePane = twc.div`grid grid-cols-1 grid-rows-1`
export const DistinationPane = twc.div`relative grid grid-cols-1 place-items-center`
