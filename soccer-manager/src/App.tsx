import './App.css'
import RosterPanel from './components/RosterPanel'
import ClockPanel from './components/ClockPanel'
import EqualPlayPanel from './components/EqualPlayPanel'
import CSVExport from './components/CSVExport'
import TacticsBoard from './components/TacticsBoard'

function App() {
  return (
    <div className="min-h-dvh text-neutral-100">
      <header className="border-b border-neutral-800 sticky top-0 bg-neutral-950/80 backdrop-blur z-10">
        <div className="container h-14 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Soccer Manager</h1>
          <div className="text-xs text-neutral-400">MVP Scaffold</div>
        </div>
      </header>
      <main className="container py-6">
        <div className="grid gap-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold text-neutral-300">Match Clock</h2>
            <ClockPanel />
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold text-neutral-300">Tactics Board</h2>
            <TacticsBoard />
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold text-neutral-300">Equal Play Analytics</h2>
            <EqualPlayPanel />
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-neutral-300">Roster</h2>
              <CSVExport />
            </div>
            <RosterPanel />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
