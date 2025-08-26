import React from 'react'
import { Box, Button } from '@mui/material'

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
        <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          <Box sx={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ fontSize: '1.25rem', fontWeight: 'semibold' }}>Something went wrong</Box>
            <Box sx={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>Please refresh the page. If the issue persists, use Export Debug and share the file.</Box>
            <Button variant="outlined" sx={{ padding: 2, borderRadius: 1, border: '1px solid var(--color-surface-400)', backgroundColor: 'var(--color-surface-200)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }} onClick={() => location.reload()}>Reload</Button>
          </Box>
        </Box>
      )
    }
    return this.props.children
  }
}