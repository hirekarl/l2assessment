import { useState, useEffect } from 'react'
import { useAnalyzeMessage } from '../hooks/useAnalyzeMessage'
import MessageForm from '../components/analyze/MessageForm'
import ResultsPanel from '../components/analyze/ResultsPanel'

function AnalyzePage() {
  const [message, setMessage] = useState(() => localStorage.getItem('exampleMessage') || '')
  const { results, isLoading, analyze, reset } = useAnalyzeMessage()

  useEffect(() => {
    // Example message (if any) was already read into initial state above;
    // this just clears it so it isn't reused on a future visit.
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
