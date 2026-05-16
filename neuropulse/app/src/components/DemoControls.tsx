import { useState } from 'react'
import { motion } from 'framer-motion'

async function post(url: string) {
  await fetch(url, { method: 'POST' })
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
    <div className="w-full rounded-xl p-5 flex flex-col gap-5 border" style={{ background: '#1a1d27', borderColor: '#222638' }}>

      {/* заголовок */}
      <div>
        <p className="text-sm font-semibold text-white">Демо-управление</p>
        <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Симуляция уровня стресса для презентации</p>
      </div>

      {/* слайдер */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase tracking-wider" style={{ color: '#64748b' }}>Уровень стресса</span>
          <span className="text-sm font-bold tabular-nums text-white">{level}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={level}
          onChange={(e) => handleSlider(Number(e.target.value))}
          className="w-full h-2 rounded-full cursor-pointer appearance-none"
          style={{ accentColor: '#7c3aed', background: `linear-gradient(to right, #7c3aed ${level}%, #222638 ${level}%)` }}
        />
        <div className="flex justify-between text-xs" style={{ color: '#64748b' }}>
          <span>Спокойно</span>
          <span>Кризис</span>
        </div>
      </div>

      {/* кнопки сценариев */}
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleRising}
          disabled={scenario === 'rising'}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: '#7c3aed' }}
        >
          {scenario === 'rising' ? '⏳ Нарастает…' : '📈 Нарастание'}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleReset}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: '#222638', color: '#94a3b8' }}
        >
          🔄 Сброс
        </motion.button>
      </div>
    </div>
  )
}
