import Rollbar from 'rollbar'

export type LogLevel = 'info' | 'warn' | 'error'

let rollbarClient: Rollbar | null = null

/**
 * Lazily constructs (and memoizes) the browser Rollbar client. Returns null
 * when VITE_ROLLBAR_CLIENT_TOKEN is unset, so local dev/CI never attempts a
 * network call.
 */
function getRollbarClient(): Rollbar | null {
  const accessToken = import.meta.env.VITE_ROLLBAR_CLIENT_TOKEN
  if (!accessToken) return null
  if (!rollbarClient) {
    rollbarClient = new Rollbar({
      accessToken,
      captureUncaught: false,
      captureUnhandledRejections: false,
    })
  }
  return rollbarClient
}

/**
 * Emits one structured, machine-parseable log line via console[level].
 * @param level - Log severity.
 * @param event - Short machine-readable event name.
 * @param fields - Additional structured context.
 */
export function logEvent(
  level: LogLevel,
  event: string,
  fields: Record<string, unknown> = {}
): void {
  console[level](JSON.stringify({ level, event, timestamp: new Date().toISOString(), ...fields }))
}

/**
 * Reports an error to Rollbar when configured; no-ops otherwise.
 * @param error - The caught exception.
 * @param context - Additional structured context attached to the report.
 */
export function reportError(error: unknown, context: Record<string, unknown> = {}): void {
  const client = getRollbarClient()
  if (!client) return
  client.error(error instanceof Error ? error : new Error(String(error)), context)
}
