import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  redirect,
  type ClientLoaderFunctionArgs,
} from '@remix-run/react'
import { loadAppConfig } from './commands'
import './styles/globals.css'

export const meta = () => {
  return [{ title: 'Clip Translator' }]
}

export const clientLoader = async ({ request }: ClientLoaderFunctionArgs) => {
  const url = new URL(request.url)
  const appConfig = await loadAppConfig()
  if (!appConfig && url.pathname !== '/config') {
    return redirect('/config')
  }
  return {}
}

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="grid min-h-screen grid-cols-1 p-4">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function HydrateFallback() {
  return (
    <p className="grid h-screen grid-cols-1 place-items-center">Loading...</p>
  )
}
