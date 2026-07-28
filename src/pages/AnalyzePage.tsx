import { useState, useEffect } from 'react'
import { useAnalyzeMessage } from '../hooks/useAnalyzeMessage'
import MessageForm from '../components/analyze/MessageForm'
import ResultsPanel from '../components/analyze/ResultsPanel'
import InlineAlert from '../components/shared/InlineAlert'

/** Analyze page: message input, triage results, and the "example message" handoff from Home. */
function AnalyzePage() {
  const [message, setMessage] = useState<string>(() => localStorage.getItem('exampleMessage') || '')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { results, isLoading, persistFailed, analyze, reset } = useAnalyzeMessage()

  useEffect(() => {
    localStorage.removeItem('exampleMessage')
  }, [])

  const handleAnalyze = async () => {
    if (!message.trim()) {
      setErrorMessage('Please enter a message to analyze')
      return
    }

    setErrorMessage(null)
    try {
      await analyze(message)
    } catch {
      setErrorMessage('Error analyzing message. Please try again.')
    }
  }

  const handleClear = () => {
    setMessage('')
    setErrorMessage(null)
    reset()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {errorMessage && (
          <InlineAlert
            variant="error"
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        )}
        <MessageForm
          message={message}
          onMessageChange={setMessage}
          onAnalyze={handleAnalyze}
          onClear={handleClear}
          isLoading={isLoading}
        />
        {results && (
          <>
            {persistFailed && (
              <InlineAlert
                variant="notice"
                message="Analysis complete, but couldn't save to history."
              />
            )}
            <ResultsPanel results={results} />
          </>
        )}
      </div>
    </div>
  )
}

export default AnalyzePage
