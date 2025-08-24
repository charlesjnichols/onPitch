import React from 'react'

type Props = { children: React.ReactNode }

type State = { hasError: boolean; error?: any }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: any, info: any) {
    console.error('[SubTracker] Uncaught error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh flex items-center justify-center p-6 text-center text-neutral-200">
          <div className="max-w-md space-y-3">
            <div className="text-xl font-semibold">Something went wrong</div>
            <div className="text-sm text-neutral-400">Please refresh the page. If the issue persists, use Export Debug and share the file.</div>
            <button className="px-3 py-2 rounded border border-neutral-700 bg-neutral-800 text-sm" onClick={() => location.reload()}>Reload</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}