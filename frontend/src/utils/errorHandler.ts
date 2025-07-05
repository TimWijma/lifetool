// Error handling utilities
export const logError = (context: string, error: unknown): void => {
  console.warn(`[${context}] Error:`, error)
}

export const safeLocalStorageOperation = <T>(
  operation: () => T,
  fallback?: T,
  context = 'localStorage operation'
): T => {
  try {
    return operation()
  } catch (error) {
    logError(context, error)
    return fallback as T
  }
}