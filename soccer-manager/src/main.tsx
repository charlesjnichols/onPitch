import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'
import { installGlobalErrorHooks } from './utils/logger'
import { ErrorBoundary } from './ErrorBoundary'

installGlobalErrorHooks()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Update available. Reload now?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    // no-op
  },
})

