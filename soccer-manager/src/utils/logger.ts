type LogLevel = 'info' | 'warn' | 'error'

export interface LogEntry {
  id: string
  level: LogLevel
  message: string
  context?: any
  timestampMs: number
}

const logs: LogEntry[] = []

export function logEvent(message: string, context?: any) {
  logs.push({ id: crypto.randomUUID(), level: 'info', message, context, timestampMs: Date.now() })
}

export function logWarn(message: string, context?: any) {
  logs.push({ id: crypto.randomUUID(), level: 'warn', message, context, timestampMs: Date.now() })
}

export function logError(message: string, context?: any) {
  logs.push({ id: crypto.randomUUID(), level: 'error', message, context, timestampMs: Date.now() })
}

export function getLogs() {
  return logs.slice()
}

export function installGlobalErrorHooks() {
  if (typeof window === 'undefined') return
  if ((window as any).__log_hooks_installed) return
  (window as any).__log_hooks_installed = true

  window.addEventListener('error', (e) => {
    logError('window.error', { message: e.message, stack: e.error?.stack })
  })
  window.addEventListener('unhandledrejection', (e) => {
    logError('unhandledrejection', { reason: String((e as any).reason) })
  })
}