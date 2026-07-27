import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import Navigation from './components/Navigation'
import { ErrorBoundary } from './components/shared/ErrorBoundary'

const HomePage = lazy(() => import('./pages/HomePage'))
const AnalyzePage = lazy(() => import('./pages/AnalyzePage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
  </div>
)

export const AppShell = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <Navigation />
    <main>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </main>
  </div>
)

/** Root component: router, nav shell, error boundary, and code-split page routes. */
function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  )
}

export default App
