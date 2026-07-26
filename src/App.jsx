import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import AnalyzePage from './pages/AnalyzePage'
import HistoryPage from './pages/HistoryPage'
import DashboardPage from './pages/DashboardPage'

/** Root component: router, nav shell, and the four top-level page routes. */
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
