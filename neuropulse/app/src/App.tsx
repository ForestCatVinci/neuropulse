import { useState } from 'react'
import './index.css'
import { useStressData } from './hooks/useStressData'
import { StressMeter } from './components/StressMeter'
import { DemoControls } from './components/DemoControls'
import { AlertScreen } from './components/AlertScreen'
import { ParentDashboard } from './components/ParentDashboard'

type Tab = 'monitor' | 'dashboard'

export default function App() {
  useStressData()
  const [tab, setTab] = useState<Tab>('monitor')

  return (
    <>
      <div className="min-h-dvh" style={{ background: '#0f1117' }}>
        <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">

          {/* шапка */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold tracking-widest uppercase text-white">
              NeuroPulse
            </h1>
            <span className="text-xs px-2 py-1 rounded" style={{ background: '#1a1d27', color: '#64748b' }}>
              MVP
            </span>
          </div>

          {/* вкладки */}
          <div className="flex border-b" style={{ borderColor: '#222638' }}>
            {(['monitor', 'dashboard'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-5 py-2.5 text-sm font-medium transition-colors relative"
                style={{ color: tab === t ? '#a78bfa' : '#64748b' }}
              >
                {t === 'monitor' ? '📡 Монитор' : '📊 Дашборд'}
                {tab === t && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                    style={{ background: '#7c3aed' }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* содержимое вкладки */}
          {tab === 'monitor' ? (
            <>
              <StressMeter />
              <DemoControls />
            </>
          ) : (
            <ParentDashboard />
          )}
        </div>
      </div>

      <AlertScreen />
    </>
  )
}
