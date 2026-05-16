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
    // сценарий длится 30 секунд
    setTimeout(() => setScenario(null), 30_000)
  }

  const handleReset = async () => {
    setScenario(null)
    setLevel(0)
    await post('/demo/scenario/reset')
  }

  return (
    <div className="w-full max-w-xs mx-auto bg-slate-800 rounded-2xl p-5 flex flex-col gap-5">
      <p className="text-xs text-slate-400 uppercase tracking-widest text-center">
        Демо-управление
      </p>

      {/* слайдер */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Уровень стресса</span>
          <span className="tabular-nums font-semibold text-slate-200">{level}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={level}
          onChange={(e) => handleSlider(Number(e.target.value))}
          className="w-full accent-violet-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-600">
          <span>Спокойно</span>
          <span>Кризис</span>
        </div>
      </div>

      {/* сценарии */}
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleRising}
          disabled={scenario === 'rising'}
          className="flex-1 py-2 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
        >
          {scenario === 'rising' ? '⏳ Растёт…' : '📈 Нарастание'}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="flex-1 py-2 rounded-xl text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
        >
          🔄 Сброс
        </motion.button>
      </div>
    </div>
  )
}
