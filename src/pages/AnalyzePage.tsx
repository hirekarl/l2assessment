import { useState, useEffect } from 'react'
import { useAnalyzeMessage } from '../hooks/useAnalyzeMessage'
import MessageForm from '../components/analyze/MessageForm'
import ResultsPanel from '../components/analyze/ResultsPanel'

/** Analyze page: message input, triage results, and the "example message" handoff from Home. */
function AnalyzePage() {
  const [message, setMessage] = useState<string>(() => localStorage.getItem('exampleMessage') || '')
  const { results, isLoading, analyze, reset } = useAnalyzeMessage()

  useEffect(() => {
    localStorage.removeItem('exampleMessage')
  }, [])

  const handleAnalyze = async () => {
    if (!message.trim()) {
      alert('Please enter a message to analyze')
      return
    }

    try {
      await analyze(message)
    } catch {
      alert('Error analyzing message. Please try again.')
    }
  }

  const handleClear = () => {
    setMessage('')
    reset()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <MessageForm
          message={message}
          onMessageChange={setMessage}
          onAnalyze={handleAnalyze}
          onClear={handleClear}
          isLoading={isLoading}
        />
        {results && <ResultsPanel results={results} />}
      </div>
    </div>
  )
}

export default AnalyzePage
