import { Link } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth.js'

/** 404 fallback page. */
function NotFound() {
  const { isAuthenticated } = useAuth()

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-5xl font-bold text-muted">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-text">Not Found</h1>
      <p className="mt-2 text-muted">The page you requested does not exist.</p>
      <Link
        className="mt-4 inline-block rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg"
        to={isAuthenticated ? '/' : '/login'}
      >
        {isAuthenticated ? 'Back to Overview' : 'Go to Login'}
      </Link>
    </section>
  )
}

export default NotFound
