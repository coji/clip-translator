import { Link } from '@remix-run/react'

export default function TestPage() {
  return (
    <div>
      <h1>Test Page</h1>
      <p>This is a test page</p>
      <Link to="/">Top Page</Link>
    </div>
  )
}
