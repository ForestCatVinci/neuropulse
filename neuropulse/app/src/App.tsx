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
      <div style={{ width: '100%', minHeight: '100vh', background: '#0f1117' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

          {/* header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 24, paddingBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff' }}>
              NeuroPulse
            </h1>
            <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: '#1a1d27', color: '#64748b', letterSpacing: '0.08em' }}>
              MVP
            </span>
          </div>

          {/* tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #222638', marginBottom: 24 }}>
            {(['monitor', 'dashboard'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '6px 6px 0 0',
                  background: tab === t ? '#7c3aed' : 'transparent',
                  color: tab === t ? '#fff' : '#64748b',
                  transition: 'background 0.2s, color 0.2s',
                  marginRight: 4,
                }}
              >
                {t === 'monitor' ? '📡 Monitor' : '📊 Dashboard'}
              </button>
            ))}
          </div>

          {/* tab content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 48 }}>
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
      </div>
      <AlertScreen />
    </>
  )
}
