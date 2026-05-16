import { useState } from 'react'
import { motion } from 'framer-motion'
import { HTTP_BASE } from '../config'

async function post(path: string) {
  await fetch(`${HTTP_BASE}${path}`, { method: 'POST' })
}

export function DemoControls() {
  const [level, setLevel] = useState(0)
  const [scenario, setScenario] = useState<string | null>(null)

  const handleSlider = async (value: number) => {
    setLevel(value)
    await post(`/demo/stress/${(value / 100).toFixed(2)}`)
  }

  const handleRising = async () => {
    setScenario('rising')
    await post('/demo/scenario/rising')
    setTimeout(() => setScenario(null), 30_000)
  }

  const handleReset = async () => {
    setScenario(null)
    setLevel(0)
    await post('/demo/scenario/reset')
  }

  return (
    <div style={{
      width: '100%',
      background: '#1a1d27',
      borderRadius: 12,
      padding: 24,
      border: '1px solid #222638',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      <div>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Demo Controls</p>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Simulate stress levels for presentation</p>
      </div>

      {/* slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
            Stress Level
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
            {level}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={level}
          onChange={(e) => handleSlider(Number(e.target.value))}
          style={{
            width: '100%',
            accentColor: '#7c3aed',
            cursor: 'pointer',
            height: 6,
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>Calm</span>
          <span style={{ fontSize: 12, color: '#64748b' }}>Crisis</span>
        </div>
      </div>

      {/* buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleRising}
          disabled={scenario === 'rising'}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            color: '#fff',
            background: '#7c3aed',
            border: 'none',
            cursor: scenario === 'rising' ? 'not-allowed' : 'pointer',
            opacity: scenario === 'rising' ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {scenario === 'rising' ? '⏳ Rising…' : '📈 Rising Stress'}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleReset}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            color: '#94a3b8',
            background: '#222638',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          🔄 Reset
        </motion.button>
      </div>
    </div>
  )
}
