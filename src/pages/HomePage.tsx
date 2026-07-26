import { Link } from 'react-router'
import { useTriageHistory } from '../hooks/useTriageHistory'

/** Landing page: summary stats, quick actions, and recent activity. */
function HomePage() {
  const { history } = useTriageHistory()
  const today = new Date().toDateString()
  const todayCount = history.filter(
    (item) => new Date(item.timestamp).toDateString() === today
  ).length

  const stats = { total: history.length, today: todayCount }
  const recentActivity = history.slice(-3).reverse()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Welcome to Relay AI Customer Triage
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            AI-powered message categorization and routing for customer support teams
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Relay AI is a subscription-based customer operations platform that uses AI to
            categorize, prioritize, and route incoming customer messages for small businesses. Our
            SaaS model is built around boosting team efficiency and enabling companies to handle
            more customer volume without hiring additional support staff.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Messages Analyzed</div>
          </div>
          <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.today}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Analyzed Today</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Link
            to="/analyze"
            className="bg-blue-600 text-white rounded-lg p-6 hover:bg-blue-700 transition text-center"
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="font-semibold mb-1">Analyze Message</div>
            <div className="text-sm text-white">Triage a new customer message</div>
          </Link>

          <Link
            to="/history"
            className="bg-purple-600 text-white rounded-lg p-6 hover:bg-purple-700 transition text-center"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold mb-1">View History</div>
            <div className="text-sm text-purple-100">See past analyses</div>
          </Link>

          <button
            onClick={() => {
              const examples = [
                "Our payment failed and we can't access our account",
                'The dashboard is loading very slowly',
                'Can you add a dark mode feature?',
              ]
              const random = examples[Math.floor(Math.random() * examples.length)]
              localStorage.setItem('exampleMessage', random)
              window.location.href = '/analyze'
            }}
            className="bg-orange-700 text-white rounded-lg p-6 hover:bg-orange-800 transition text-center"
          >
            <div className="text-2xl mb-2">🎯</div>
            <div className="font-semibold mb-1">Try Example</div>
            <div className="text-sm text-white">Use a sample message</div>
          </button>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivity.map((item, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                      <div className="text-gray-700 dark:text-gray-300 truncate">
                        "{item.message.substring(0, 60)}..."
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                          {item.category}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            item.urgency === 'High'
                              ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                              : item.urgency === 'Medium'
                                ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                                : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                          }`}
                        >
                          {item.urgency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentActivity.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-gray-600 dark:text-gray-400 mb-4">No messages analyzed yet</div>
            <Link
              to="/analyze"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Analyze Your First Message
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
