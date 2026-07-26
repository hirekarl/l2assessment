import { Link, useLocation } from 'react-router'
import { useTheme } from '../contexts/useTheme'

/** Top nav bar: brand mark, route links with active-state styling, and the theme toggle. */
function Navigation() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const isActive = (path: string): boolean => {
    return location.pathname === path
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white shadow-lg border-b border-blue-500/20 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 group hover:opacity-95 transition-opacity"
          >
            <div className="bg-white/95 dark:bg-gray-800 rounded-xl w-10 h-10 flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
              📧
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight text-white">Relay AI</div>
              <div className="text-[11px] text-blue-100 dark:text-gray-400 font-medium">
                Customer Triage
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="px-3 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-700/50 text-lg transition-colors"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/')
                  ? 'bg-blue-700 font-semibold text-white shadow-inner'
                  : 'hover:bg-white/10 dark:hover:bg-gray-700/50 text-blue-50 dark:text-gray-300'
              }`}
            >
              Home
            </Link>
            <Link
              to="/analyze"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/analyze')
                  ? 'bg-blue-700 font-semibold text-white shadow-inner'
                  : 'hover:bg-white/10 dark:hover:bg-gray-700/50 text-blue-50 dark:text-gray-300'
              }`}
            >
              Analyze
            </Link>
            <Link
              to="/history"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/history')
                  ? 'bg-blue-700 font-semibold text-white shadow-inner'
                  : 'hover:bg-white/10 dark:hover:bg-gray-700/50 text-blue-50 dark:text-gray-300'
              }`}
            >
              History
            </Link>
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/dashboard')
                  ? 'bg-blue-700 font-semibold text-white shadow-inner'
                  : 'hover:bg-white/10 dark:hover:bg-gray-700/50 text-blue-50 dark:text-gray-300'
              }`}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
