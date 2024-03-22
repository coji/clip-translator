import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import './styles/globals.css'

export const meta = () => {
  return [{ title: 'Clip Translator' }]
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
      <body>
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
