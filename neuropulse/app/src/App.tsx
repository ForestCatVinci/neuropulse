import { useState } from 'react'
import './index.css'
import { useStressData } from './hooks/useStressData'
import { StressMeter } from './components/StressMeter'
import { DemoControls } from './components/DemoControls'
import { AlertScreen } from './components/AlertScreen'
import { ParentDashboard } from './components/ParentDashboard'

type Tab = 'monitor' | 'dashboard'

function App() {
  useStressData()
  const [tab, setTab] = useState<Tab>('monitor')

  return (
    <>
      <main className="flex flex-col items-center min-h-dvh p-6 gap-6">
        <h1 className="text-xl font-semibold text-slate-300 tracking-widest uppercase">
          NeuroPulse
        </h1>

        {/* вкладки */}
        <div className="flex bg-slate-800 rounded-xl p-1 gap-1 w-full max-w-xs">
          {(['monitor', 'dashboard'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'monitor' ? '📡 Монитор' : '📊 Дашборд'}
            </button>
          ))}
        </div>

        {tab === 'monitor' ? (
          <>
            <StressMeter />
            <DemoControls />
          </>
        ) : (
          <ParentDashboard />
        )}
      </main>
      <AlertScreen />
    </>
  )
}

export default App
