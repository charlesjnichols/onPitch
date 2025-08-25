import './App.css'
import { useState } from 'react'
import RosterTab from './components/RosterTab'
import LineupTab from './components/LineupTab'
import MatchTab from './components/MatchTab'

function App() {
  const [tab, setTab] = useState<'roster' | 'lineup' | 'match'>('roster')

  return (
    <div className="min-h-dvh dark-theme pb-[env(safe-area-inset-bottom)] field-pattern">
      <header className="glass border-b border-surface-400 sticky top-0 z-10 pt-[env(safe-area-inset-top)]">
        <div className="container h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">⚽ Soccer Manager</h1>
          <nav className="flex gap-1 p-1 bg-surface-300 rounded-lg tab-navigation">
            <button 
              className={`tab-button px-4 py-2 ${tab==='roster' ? 'active' : ''}`} 
              onClick={() => setTab('roster')}
            >
              Roster
            </button>
            <button 
              className={`tab-button px-4 py-2 ${tab==='lineup' ? 'active' : ''}`} 
              onClick={() => setTab('lineup')}
            >
              Lineup
            </button>
            <button 
              className={`tab-button px-4 py-2 ${tab==='match' ? 'active' : ''}`} 
              onClick={() => setTab('match')}
            >
              Match
            </button>
          </nav>
        </div>
      </header>
      <main className="container py-6 space-y-6">
        {tab === 'roster' && (
          <RosterTab onSendToLineup={() => setTab('lineup')} />
        )}
        {tab === 'lineup' && (
          <LineupTab />
        )}
        {tab === 'match' && (
          <MatchTab />
        )}
      </main>
    </div>
  )
}

export default App
