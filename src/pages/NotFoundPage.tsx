import { useEffect } from 'react'

/**
 * Client-side 404 for unmatched routes. Vercel's SPA rewrite always returns
 * HTTP 200, so this also flips the page's robots meta to noindex for
 * crawlers that execute JS (e.g. Googlebot), restoring it on unmount.
 */
function NotFoundPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Page Not Found — Relay AI'

    const robotsMeta = document.querySelector('meta[name="robots"]')
    const previousRobotsContent = robotsMeta?.getAttribute('content')
    robotsMeta?.setAttribute('content', 'noindex, nofollow')

    return () => {
      document.title = previousTitle
      if (robotsMeta && previousRobotsContent) {
        robotsMeta.setAttribute('content', previousRobotsContent)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Page not found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <a
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
        >
          Back to Home
        </a>
      </div>
    </div>
  )
}

export default NotFoundPage
