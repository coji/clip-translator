import { Link } from '@remix-run/react'

export default function IndexPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold">Hello Remix SPA mode on Tauri!</h1>
      <img src="/tauri.svg" alt="tauri" />
      <Link to="/test" className="text-blue-500 underline">
        Test Page
      </Link>
    </div>
  )
}
