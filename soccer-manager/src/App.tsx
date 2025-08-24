import './App.css'
import { useState } from 'react'
import RosterTab from './components/RosterTab'
import LineupTab from './components/LineupTab'
import MatchTab from './components/MatchTab'

function App() {
  const [tab, setTab] = useState<'roster' | 'lineup' | 'match'>('roster')

  return (
    <div className="min-h-dvh text-neutral-100 pb-[env(safe-area-inset-bottom)]">
      <header className="border-b border-neutral-800 sticky top-0 bg-neutral-950/80 backdrop-blur z-10 pt-[env(safe-area-inset-top)]">
        <div className="container h-14 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Soccer Manager</h1>
          <nav className="flex gap-2 text-sm">
            <button className={`px-3 py-1.5 rounded ${tab==='roster' ? 'bg-neutral-800 border border-neutral-700' : 'text-neutral-300'}`} onClick={() => setTab('roster')}>Roster</button>
            <button className={`px-3 py-1.5 rounded ${tab==='lineup' ? 'bg-neutral-800 border border-neutral-700' : 'text-neutral-300'}`} onClick={() => setTab('lineup')}>Lineup</button>
            <button className={`px-3 py-1.5 rounded ${tab==='match' ? 'bg-neutral-800 border border-neutral-700' : 'text-neutral-300'}`} onClick={() => setTab('match')}>Match</button>
          </nav>
        </div>
      </header>
      <main className="container py-6">
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
