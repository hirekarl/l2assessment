export interface InlineAlertProps {
  message: string
  variant: 'error' | 'notice'
  onDismiss?: () => void
}

const VARIANT_STYLES = {
  error: {
    role: 'alert',
    live: 'assertive',
    container:
      'bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400',
    dismiss: 'text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200',
  },
  notice: {
    role: 'status',
    live: 'polite',
    container:
      'bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300',
    dismiss: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100',
  },
} as const

/** A dismissible inline banner for surfacing a single error or notice message in-flow. */
function InlineAlert({ message, variant, onDismiss }: InlineAlertProps) {
  const styles = VARIANT_STYLES[variant]

  return (
    <div
      role={styles.role}
      aria-live={styles.live}
      className={`mb-4 rounded-lg px-4 py-3 flex items-center justify-between gap-3 text-sm font-medium ${styles.container}`}
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className={`shrink-0 font-bold cursor-pointer ${styles.dismiss}`}
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default InlineAlert
